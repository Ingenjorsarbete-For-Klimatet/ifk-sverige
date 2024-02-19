import { Model } from "@luma.gl/core";
import { Layer, project32, picking } from "@deck.gl/core";
import { Delaunay } from "d3-delaunay";
import GL from "@luma.gl/constants";

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
    //console.log("viewport", this.context.viewport)
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

import { CompositeLayer } from "deck.gl";

import { MVTLayer, TileLayer } from "@deck.gl/geo-layers";
import { MVTLoader } from "@loaders.gl/mvt";

import { ScatterplotLayer } from "@deck.gl/layers";

import { PMTilesSource } from "@loaders.gl/pmtiles";

import { interpolateYlOrRd } from "d3-scale-chromatic";
import { color } from "d3-color";
import { scaleQuantize } from "d3-scale";

function hexToRGB(hex) {
  const c = color(hex);
  return [c.r, c.g, c.b];
}

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
}

function getTilesInViewport(viewport, zoom) {
  const { width, height, latitude, longitude, zoom: currentZoom } = viewport;
  const tiles = [];

  const tileSize = 256; // Standard tile size for most map tile services
  const worldSize = Math.pow(2, zoom) * tileSize;

  const topLeft = viewport.unproject([0, 0]);
  const bottomRight = viewport.unproject([width, height]);

  const tileX1 =
    Math.floor((topLeft[0] + worldSize) / tileSize) % Math.pow(2, zoom);
  const tileY1 =
    Math.floor((topLeft[1] + worldSize) / tileSize) % Math.pow(2, zoom);
  const tileX2 =
    Math.floor((bottomRight[0] + worldSize) / tileSize) % Math.pow(2, zoom);
  const tileY2 =
    Math.floor((bottomRight[1] + worldSize) / tileSize) % Math.pow(2, zoom);

  console.log("tileX1", tileX1);
  console.log("tileY1", tileY1);
  console.log("tileX2", tileX2);
  console.log("tileY2", tileY2);

  for (let x = tileX1; x <= tileX2; x++) {
    for (let y = tileY1; y <= tileY2; y++) {
      tiles.push({ x, y, zoom });
    }
  }

  return tiles;
}

async function getMetadata(source) {
  return await source.getMetadata();
}

function getTileCoordinates(boundingBox, zoom) {
  const minX = lon2tile(boundingBox[0], zoom);
  const maxX = lon2tile(boundingBox[2], zoom);
  const maxY = lat2tile(boundingBox[1], zoom);
  const minY = lat2tile(boundingBox[3], zoom);

  return { minX, maxX, minY, maxY, zoom };
}

async function getAllTiles(source, tiles, viewTiles) {
  const zoom = viewTiles.zoom;

  let data = [];
  for (let i = viewTiles.minY - 1; i <= viewTiles.maxY + 1; i++) {
    for (let j = viewTiles.minX - 1; j <= viewTiles.maxX + 1; j++) {
      if (!tiles.hasOwnProperty(`${j}${i}${zoom}`)) {
        tiles[`${j}${i}${zoom}`] = await source.getVectorTile({
          x: j,
          y: i,
          zoom: Math.floor(zoom),
        });
      }

      let tile = tiles[`${j}${i}${zoom}`];

      if (tile != null) {
        tile = tile.features.map((x) => {
          return { c: x.geometry.coordinates, t: x.properties.t };
        });

        data = data.concat(tile);
      }
    }
  }

  //console.log("data", zoom, data);

  return data;
}

function clearTiles(tiles, viewTiles) {
  const keepKeys = [];
  for (let i = viewTiles.minY - 2; i <= viewTiles.maxY + 2; i++) {
    for (let j = viewTiles.minX - 2; j <= viewTiles.maxX + 2; j++) {
      keepKeys.push(`${j}${i}${viewTiles.zoom}`);
    }
  }

  for (var key in tiles) {
    if (tiles.hasOwnProperty(key)) {
      if (!keepKeys.includes(key)) {
        delete tiles[key];
      }
    }
  }
}

function reloadData(viewTiles, oldViewTiles) {
  const {
    minX: minXOld,
    minY: minYOld,
    maxX: maxXOld,
    maxY: maxYOld,
    zoom: zoomOld,
  } = oldViewTiles;
  const { minX, minY, maxX, maxY, zoom } = viewTiles;

  const reload = {
    tiles: false,
    zoom: false,
  };

  if (
    minX != minXOld ||
    minY != minYOld ||
    maxX != maxXOld ||
    maxY != maxYOld
  ) {
    reload.tiles = true;
  }

  if (Math.abs(zoom - (zoomOld - (zoomOld % Math.floor(zoomOld)))) >= 1) {
    reload.zoom = true;
  }

  return reload;
}

export class MyLayer extends CompositeLayer {
  initializeState() {
    const source = new PMTilesSource({
      url: "http://localhost:5173/mesan.pmtiles",
    });

    const viewTiles = getTileCoordinates(
      this.context.viewport.getBounds(),
      this.context.viewport.zoom,
    );
    viewTiles.zoom = viewTiles.zoom > 10 ? 10 : viewTiles.zoom;
    const tiles = {};

    const ldata = getAllTiles(source, tiles, viewTiles);

    this.setState({
      source: source,
      storage: {},
      viewTiles,
      ldata,
      tiles,
    });
  }

  updateState() {
    const viewTiles = getTileCoordinates(
      this.context.viewport.getBounds(),
      Math.floor(this.context.viewport.zoom),
    );

    const reload = reloadData(viewTiles, this.state.viewTiles);
    if (reload.tiles == true || reload.zoom == true) {
      viewTiles.zoom = viewTiles.zoom > 10 ? 10 : viewTiles.zoom;

      const ldata = getAllTiles(this.state.source, this.state.tiles, viewTiles);
      clearTiles(this.state.tiles, viewTiles);

      this.setState({
        storage: {},
        viewTiles,
        ldata,
        tiles: this.state.tiles,
      });
    } else {
      this.setState({
        storage: {},
      });
    }
  }

  renderLayers() {
    //console.log("this", this)
    return [
      // @ts-ignore
      new DelaunayLayer({
        id: "c",
        data: this.state.ldata,
        getPosition: (d) => {
          //console.log(d.c)
          return d.c;
        },
        getValue: (d) => {
          const t = d.t
            .replace("[", "")
            .replace("]", "")
            .split(",")
            .map((x) => Number(x));
          return t[0];
        },
        colorScale: (x) => {
          const q = scaleQuantize(
            [-10, 20],
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          );
          //console.log(q(x))
          //let col = interpolateYlOrRd((x + 30) / 50);
          //console.log("x", x)
          //console.log("q(x)", q(x))
          //console.log("rgb", hexToRGB(interpolateYlOrRd(q(x))))
          return [...hexToRGB(interpolateYlOrRd(q(x))), this.props.alpha];
          //return [...hexToRGB(interpolateYlOrRd((x + 30) / 50)), 200];
        },
        updateTriggers: {
          colorScale: [this.props.alpha],
        },
      }),
    ];
  }
}

MyLayer.layerName = "MyLayer";
