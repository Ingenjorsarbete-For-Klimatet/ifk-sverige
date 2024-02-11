import { Model } from "@luma.gl/core";
import { Layer, project32, picking } from "@deck.gl/core";
import { MVTLayer } from "@deck.gl/geo-layers";
import { Delaunay } from "d3-delaunay";
import GL from "@luma.gl/constants";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";

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

export class DelaunayLayer extends PMTLayer {
  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, picking],
    });
  }

  protected _getAttributeManager(): AttributeManager | null {
    const context = this.context;
    return new AttributeManager(context.device, {
      id: this.props.id,
      stats: context.stats,
      timeline: context.timeline,
    });
  }

  getAttributeManager(): AttributeManager | null {
    return this._getAttributeManager();
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    super.initializeState();

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

    const { props, oldProps, context, changeFlags } = params;
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
      this._updateTileset();
      this.setState({ valueRange: this.getValueRange() });
    }

    if (this.state?.data) {
      super.updateState({ props, oldProps, context, changeFlags });
      this._setWGS84PropertyForTiles();
    }

    console.log(this);
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
    console.log("1");
    const { data, getPosition } = this.props;

    const points = data.map(getPosition);
    const delaunay = Delaunay.from(points);
    const indices = delaunay.triangles;

    //console.log(points)
    //console.log(delaunay)
    //console.log(indices)

    this.state.vertexCount = indices.length;
    attribute.value = new Uint32Array(indices);
  }
}

DelaunayLayer.layerName = "DelaunayLayer";
DelaunayLayer.defaultProps = defaultProps;

import { DataFilterExtension } from "@deck.gl/extensions";

import { PMTilesSource } from "@loaders.gl/pmtiles";
import { load } from "@loaders.gl/core";

const url = "http://localhost:5173/file_2.pmtiles";
const source = new PMTilesSource({ url });
const tile = await source.getTile({ layers: "file_2", zoom: 0, x: 0, y: 0 });
const vtile = await source.getVectorTile({
  layers: "file_2",
  zoom: 0,
  x: 0,
  y: 0,
});
const h = await source.getMetadata();
console.log(source);
console.log(tile);
console.log(vtile);
console.log(h);

import { CompositeLayer } from "deck.gl";

export class MyCompositeLayer extends CompositeLayer {
  initializeState() {}

  updateState({ changeFlags }) {
    const { data } = this.props;
    const udata = data;
    //console.log(data)
    this.setState({ udata });
  }

  renderLayers() {
    return [
      new PMTLayer(this.props, this.getSubLayerProps({ id: "geojson" }), {
        data: this.props.data,
      }),
      // @ts-ignore
      new DelaunayLayer(this.getSubLayerProps({ id: "text" }), {
        data: this.state.labelData,
        getPosition: (d) => d.c,
        getValue: (d) => {
          return d.d;
        },
        colorScale: (x) => {
          return [...hexToRGB(interpolateYlOrRd((x + 30) / 50)), 200];
        },
      }),
    ];
  }
}

MyCompositeLayer.layerName = "MyCompositeLayer";
MyCompositeLayer.defaultProps = defaultProps;
