import { Model } from "@luma.gl/core";
import { Layer, project32, picking } from "@deck.gl/core";
import { MVTLayer } from "@deck.gl/geo-layers";
import { Delaunay } from "d3-delaunay";
import GL from "@luma.gl/constants";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";

import { PMTLoader } from "@mgcth/deck.gl-pmtiles";

import { AttributeManager } from "@deck.gl/core";

const defaultProps = {
  getPosition: { type: "accessor", value: (d) => d.position },
  getValue: { type: "accessor", value: (d) => 0 },
  colorScale: { type: "function", value: (x) => [255, 0, 0] },
};

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

export default class DelaunayLayer extends Layer {
  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, picking],
    });
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.remove(["instancePickingColors"]);

    attributeManager.add({
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
        transform: (x) => this.getCurrentLayer().props.colorScale(x),
      },
      pickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        accessor: "getValue",
        transform: (x) => {
          const [min, max] = this.state.valueRange;
          const normalizedValue = Math.round(
            ((x - min) / (max - min)) * PICKABLE_VALUE_RANGE,
          );
          return this.encodePickingColor(normalizedValue);
        },
      },
    });
  }

  updateState(params) {
    super.updateState(params);

    const { changeFlags } = params;
    if (changeFlags.extensionsChanged) {
      if (this.state.model) {
        this.state.model.delete();
      }

      this.setState({ model: this._getModel(this.context.gl) });
      this.getAttributeManager().invalidateAll();
    }
    if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        changeFlags.updateTriggersChanged.getValue)
    ) {
      this.setState({ valueRange: this.getValueRange() });
    }
  }

  draw({ uniforms }) {
    this.state.model.setVertexCount(this.state.vertexCount);
    this.state.model.setUniforms(uniforms).draw();
  }

  getPickingInfo({ info }) {
    if (info.index >= 0) {
      const {
        valueRange: [min, max],
      } = this.state;
      info.object = null;
      info.value = (info.index / PICKABLE_VALUE_RANGE) * (max - min) + min;
    }
    return info;
  }

  _getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.id,
        drawMode: GL.TRIANGLES,
        isInstanced: false,
      }),
    );
  }

  getValueRange() {
    const { data, getValue } = this.props;
    let min = Infinity;
    let max = -Infinity;
    for (const object of data) {
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

  calculateIndices(attribute) {
    const { data, getPosition } = this.props;

    const points = data.map(getPosition);
    const delaunay = Delaunay.from(points);
    const indices = delaunay.triangles;

    this.state.vertexCount = indices.length;
    attribute.value = new Uint32Array(indices);
  }
}

DelaunayLayer.layerName = "DelaunayLayer";
DelaunayLayer.defaultProps = defaultProps;

// import { DataFilterExtension } from "@deck.gl/extensions";

// import { PMTilesSource } from "@loaders.gl/pmtiles";
// import { load } from "@loaders.gl/core";

// const url = "http://localhost:5173/file_2.pmtiles";
// const source = new PMTilesSource({ url });
// const tile = await source.getTile({ layers: "file_2", zoom: 0, x: 0, y: 0 });
// const vtile = await source.getVectorTile({
//   layers: "file_2",
//   zoom: 0,
//   x: 0,
//   y: 0,
// });
// const h = await source.getMetadata();
// console.log(source);
// console.log(tile);
// console.log(vtile);
// console.log(h);

import { CompositeLayer } from "deck.gl";

export class MyCompositeLayer extends CompositeLayer {
  updateState({ changeFlags }) {
    console.log(this);
    const { data } = this.props;
    console.log(data);
    if (changeFlags.dataChanged && data) {
      //console.log(data)
      const udata = data;

      //this.setState({udata});
    }
  }

  renderLayers() {
    //console.log(this.props)
    return [
      new PMTLayer(this.props, this.getSubLayerProps({ id: "geojson" }), {
        data: this.props.data,
      }),
      // // @ts-ignore
      // new DelaunayLayer(this.getSubLayerProps({ id: "text" }), {
      //   data: this.state.labelData,
      //   getPosition: (d) => d.c,
      //   getValue: (d) => {
      //     return d.d;
      //   },
      //   colorScale: (x) => {
      //     return [...hexToRGB(interpolateYlOrRd((x + 30) / 50)), 200];
      //   },
      // }),
    ];
  }
}

import { type TileLayerProps } from "@deck.gl/geo-layers/typed";
import { GeoJsonLayer, type GeoJsonLayerProps } from "@deck.gl/layers/typed";
import { type DefaultProps } from "@deck.gl/core/typed";
import type { Loader } from "@loaders.gl/loader-utils";

export type TileJson = {
  tilejson: string;
  tiles: string[];
  // eslint-disable-next-line camelcase
  vector_layers: any[];
  attribution?: string;
  scheme?: string;
  maxzoom?: number;
  minzoom?: number;
  version?: string;
};
export type _MVTLayerProps = {
  /** Called if `data` is a TileJSON URL when it is successfully fetched. */
  onDataLoad?: ((tilejson: TileJson | null) => void) | null;

  /** Needed for highlighting a feature split across two or more tiles. */
  uniqueIdProperty?: string;

  /** A feature with ID corresponding to the supplied value will be highlighted. */
  highlightedFeatureId?: string | null;

  /**
   * Use tile data in binary format.
   *
   * @default true
   */
  binary?: boolean;

  /**
   * Loaders used to transform tiles into `data` property passed to `renderSubLayers`.
   *
   * @default [MVTWorkerLoader] from `@loaders.gl/mvt`
   */
  loaders?: Loader[];
};

export type ParsedPmTile = Feature[] | BinaryFeatures;
export type ExtraProps = {
  raster?: boolean;
};

export type _PMTLayerProps = _MVTLayerProps & ExtraProps;
export type PmtLayerProps = _PMTLayerProps & TileLayerProps<ParsedPmTile>;

const defaultPropsMy: DefaultProps<PmtLayerProps> = {
  ...GeoJsonLayer.defaultProps,
  onDataLoad: { type: "function", value: null, optional: true, compare: false },
  uniqueIdProperty: "",
  highlightedFeatureId: null,
  binary: true,
  raster: false,
  loaders: [PMTLoader],
  loadOptions: { worker: false },
};

MyCompositeLayer.layerName = "MyCompositeLayer";
MyCompositeLayer.defaultProps = defaultPropsMy;
