import {
  Layer,
  picking,
  project32,
  Accessor,
  LayerProps,
  UpdateParameters,
  PickingInfo,
  GetPickingInfoParams,
  DefaultProps,
} from "@deck.gl/core";
import { GL } from "@luma.gl/constants";
import { Device } from "@luma.gl/core";
import { Model } from "@luma.gl/engine";
// @ts-ignore
import { Delaunay } from "d3-delaunay";

type ColorScale<DataT> = (data: DataT) => Array<number>;

const defaultProps: DefaultProps<DelaunayLayerProps> = {
  getPosition: { type: "accessor", value: (d: any) => d.position },
  getValue: { type: "accessor", value: () => 0 },
  colorScale: { type: "function", value: () => [255, 0, 0] },
};

type _DelaunayLayerProps<DataT> = {
  getPosition?: Accessor<DataT, Array<number>>;
  getValue?: Accessor<DataT, number>;
  colorScale?: ColorScale<DataT>;
};

export type DelaunayLayerProps<DataT = unknown> = _DelaunayLayerProps<DataT> &
  LayerProps;

const PICKABLE_VALUE_RANGE = 256 * 256 * 256 - 1;

const vs = `\
#version 300 es
#define SHADER_NAME delaunay-layer-vertex-shader

in vec3 positions;
in vec3 positions64Low;
in vec4 colors;
in vec3 pickingColors;

uniform float opacity;
out vec4 vColor;

void main(void) {
  geometry.worldPosition = positions;
  geometry.pickingColor = pickingColors;

  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vColor = vec4(colors.rgb, colors.a * opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

const fs = `\
#version 300 es
#define SHADER_NAME delaunay-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vColor;

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default class DelaunayLayer<
  DataT = any,
  ExtraPropsT extends {} = {},
> extends Layer<ExtraPropsT & Required<_DelaunayLayerProps<DataT>>> {
  static layerName = "DelaunayLayer";
  static defaultProps = defaultProps;

  state!: {
    disablePicking?: boolean;
    model?: Model;
    mesh?: any;
    coordinateConversion: number;
    bounds: number[];
  };

  getShaders(): void {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, picking],
    });
  }

  initializeState(): void {
    const attributeManager = this.getAttributeManager();

    attributeManager?.remove(["instancePickingColors"]);

    attributeManager?.add({
      indices: {
        size: 1,
        isIndexed: true,
        noAlloc: true,
        accessor: "getPositions",
        update: this.calculateIndices,
      },
      positions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        //transition: true,
        accessor: "getPosition",
      },
      colors: {
        size: 4,
        type: "unorm8",
        //normalized: true,
        //transition: true,
        accessor: "getValue",
        defaultValue: [0, 0, 0, 255],
        transform: (x) => this.getCurrentLayer()?.props.colorScale(x),
      },
      pickingColors: {
        size: 3,
        type: "uint8",
        accessor: "getValue",
        transform: (x) => {
          // @ts-ignore
          const [min, max] = this.state.valueRange;
          const normalizedValue = Math.round(
            ((x - min) / (max - min)) * PICKABLE_VALUE_RANGE,
          );
          return this.encodePickingColor(normalizedValue);
        },
      },
    });

    this.setState({});
  }

  updateState(params: UpdateParameters<this>): void {
    //console.log("viewport", this.context.viewport)
    super.updateState(params);

    const { changeFlags } = params;
    if (changeFlags.extensionsChanged) {
      if (this.state.model) {
        // @ts-ignore
        this.state.model.delete();
      }

      this.setState({ model: this._getModel(this.context.device) });
      this.getAttributeManager()?.invalidateAll();
    }
    if (
      changeFlags.dataChanged ||
      // @ts-ignore
      changeFlags.updateTriggersChanged?.getValue
    ) {
      this.setState({ valueRange: this.getValueRange() });
    }
  }

  draw({ uniforms }): void {
    const { model } = this.state;
    model?.setVertexCount(this.state.vertexCount);
    model?.setUniforms(uniforms);
    model?.draw(this.context.renderPass);
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info: PickingInfo = params.info;

    if (info.index >= 0) {
      const {
        // @ts-ignore
        valueRange: [min, max],
      } = this.state;
      info.object = null;
      // @ts-ignore
      info.value = (info.index / PICKABLE_VALUE_RANGE) * (max - min) + min;
    }
    return info;
  }

  // @ts-ignore
  _getModel(device: Device): Model {
    return new Model(
      device,
      Object.assign({}, this.getShaders(), {
        id: this.id,
        bufferLayout: this.getAttributeManager().getBufferLayouts(),
        topology: "triangle-list",
        isInstanced: false,
      }),
    );
  }

  getValueRange(): Array<number> {
    const { data, getValue } = this.props;
    let min = Infinity;
    let max = -Infinity;
    // @ts-ignore
    for (const object of data) {
      // @ts-ignore
      const v = getValue(object) || 0;
      min = v < min ? v : min;
      max = v > max ? v : max;
    }
    // Make sure that the range is always positive
    if (min > max) {
      min = 0;
      max = 1;
    } else if (min === max) {
      max = min + 1;
    }
    return [min, max];
  }

  // @ts-ignore
  calculateIndices(attribute): void {
    const { data, getPosition } = this.props;

    // @ts-ignore
    const points = data.map(getPosition);
    const delaunay = Delaunay.from(points);
    const indices = delaunay.triangles;

    this.state.vertexCount = indices.length;
    attribute.value = new Uint32Array(indices);
  }
}
