import {
  Layer,
  picking,
  project32,
  DefaultProps,
  Accessor,
  LayerProps,
  UpdateParameters,
  PickingInfo,
  GetPickingInfoParams,
} from "@deck.gl/core";
import GL from "@luma.gl/constants";
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
#define SHADER_NAME delaunay-layer-vertex-shader

attribute vec3 positions;
attribute vec3 positions64Low;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float opacity;
varying vec4 vColor;

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
#define SHADER_NAME delaunay-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default class DelaunayLayer<
  DataT = any,
  ExtraPropsT extends {} = {},
> extends Layer<ExtraPropsT & Required<_DelaunayLayerProps<DataT>>> {
  static layerName = "DelaunayLayer";
  static defaultProps = defaultProps;

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
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition",
      },
      colors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: "getValue",
        defaultValue: [0, 0, 0, 255],
        transform: (x) => this.getCurrentLayer()?.props.colorScale(x),
      },
      pickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
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

      this.setState({ model: this._getModel(this.context.gl) });
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

  // @ts-ignore
  draw({ uniforms }): void {
    // @ts-ignore
    this.state.model?.setVertexCount(this.state.vertexCount);
    // @ts-ignore
    this.state.model?.setUniforms(uniforms).draw();
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
  _getModel(gl): Model {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.id,
        drawMode: GL.TRIANGLES,
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
