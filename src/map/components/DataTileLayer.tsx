import { PMTilesSource } from "@loaders.gl/pmtiles";
// @ts-ignore
import { color } from "d3-color";
// @ts-ignore
import { scaleQuantize } from "d3-scale";
// @ts-ignore
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { CompositeLayer, CompositeLayerProps, Viewport } from "@deck.gl/core";

import DelaunayLayer from "./DelaunayLayer";
import { ViewTile, Reload, DataLayerState, DataTileMap } from "../types.tsx";

const defaultProps = {
  alpha: { type: "number", value: 0 },
  data: { type: "string", value: "" },
};

type _DataTileLayerProps = {
  alpha?: number;
  data?: string;
};

export type DelaunayLayerProps = _DataTileLayerProps & CompositeLayerProps;

export default class DataTileLayer<
  ExtraPropsT extends {} = {},
> extends CompositeLayer<ExtraPropsT & Required<_DataTileLayerProps>> {
  static layerName = "DataTileLayer";
  static defaultProps = defaultProps;

  initializeState(): void {
    const source = new PMTilesSource({
      url: this.props.data,
    });

    const viewTiles = this.getTileCoordinates(
      this.context.viewport.getBounds(),
      this.context.viewport.zoom,
    );
    viewTiles.zoom = viewTiles.zoom > 10 ? 10 : viewTiles.zoom;
    const tiles = new Map() as DataTileMap;

    const ldata = this.getAllTiles(source, tiles, viewTiles);

    this.setState({
      source: source,
      storage: new Map(),
      viewTiles,
      ldata,
      tiles,
    } as DataLayerState);
  }

  updateState(): void {
    const viewTiles = this.getTileCoordinates(
      this.context.viewport.getBounds(),
      Math.floor(this.context.viewport.zoom),
    );

    const reload = this.reloadData(viewTiles, this.state.viewTiles as ViewTile);
    if (reload.tiles == true || reload.zoom == true) {
      viewTiles.zoom = viewTiles.zoom > 10 ? 10 : viewTiles.zoom;

      const ldata = this.getAllTiles(
        this.state.source as PMTilesSource,
        this.state.tiles as DataTileMap,
        viewTiles,
      );
      this.clearTiles(this.state.tiles as DataTileMap, viewTiles);

      this.setState({
        storage: new Map(),
        viewTiles,
        ldata,
        tiles: this.state.tiles,
      } as DataLayerState);
    } else {
      this.setState({
        storage: new Map(),
      });
    }
  }

  renderLayers() {
    return [
      // @ts-ignore
      new DelaunayLayer({
        id: "c",
        data: this.state.ldata,
        getPosition: (d) => {
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
          return [...this.hexToRGB(interpolateYlOrRd(q(x))), this.props.alpha];
        },
        updateTriggers: {
          colorScale: [this.props.alpha],
        },
      }),
    ];
  }

  hexToRGB(hex: string): Array<number> {
    const c = color(hex);
    return [c.r, c.g, c.b];
  }

  lon2tile(lon: number, zoom: number): number {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  }
  lat2tile(lat: number, zoom: number): number {
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

  getTilesInViewport(
    viewport: Viewport,
    zoom: number,
  ): Array<{ x: number; y: number; zoom: number }> {
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

    for (let x = tileX1; x <= tileX2; x++) {
      for (let y = tileY1; y <= tileY2; y++) {
        tiles.push({ x, y, zoom });
      }
    }

    return tiles;
  }

  async getMetadata(source: PMTilesSource) {
    return await source.getMetadata();
  }

  getTileCoordinates(boundingBox: Array<number>, zoom: number): ViewTile {
    const minX = this.lon2tile(boundingBox[0], zoom);
    const maxX = this.lon2tile(boundingBox[2], zoom);
    const maxY = this.lat2tile(boundingBox[1], zoom);
    const minY = this.lat2tile(boundingBox[3], zoom);

    return { minX, maxX, minY, maxY, zoom };
  }

  async getAllTiles(
    source: PMTilesSource,
    tiles: Map<string, Promise<unknown | null>>,
    viewTiles: ViewTile,
  ): Promise<Array<{ c: number; t: number }>> {
    const zoom = viewTiles.zoom;

    let data = [];
    for (let i = viewTiles.minY - 1; i <= viewTiles.maxY + 1; i++) {
      for (let j = viewTiles.minX - 1; j <= viewTiles.maxX + 1; j++) {
        if (!tiles.hasOwnProperty(`${j}${i}${zoom}`)) {
          tiles.set(
            `${j}${i}${zoom}`,
            await source.getVectorTile({
              layers: "",
              x: j,
              y: i,
              zoom: Math.floor(zoom),
            }),
          );
        }

        let tile = tiles.get(`${j}${i}${zoom}`);

        if (tile != null) {
          tile = tile.features.map((x) => {
            return { c: x.geometry.coordinates, t: x.properties.t };
          });

          data = data.concat(tile);
        }
      }
    }
    return data;
  }

  clearTiles(tiles: Map<string, any>, viewTiles: ViewTile): void {
    const keepKeys = [];
    for (let i = viewTiles.minY - 2; i <= viewTiles.maxY + 2; i++) {
      for (let j = viewTiles.minX - 2; j <= viewTiles.maxX + 2; j++) {
        keepKeys.push(`${j}${i}${viewTiles.zoom}`);
      }
    }

    for (const key in tiles) {
      if (tiles.hasOwnProperty(key)) {
        if (!keepKeys.includes(key)) {
          tiles.delete(key);
        }
      }
    }
  }

  reloadData(viewTiles: ViewTile, oldViewTiles: ViewTile): Reload {
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
}
