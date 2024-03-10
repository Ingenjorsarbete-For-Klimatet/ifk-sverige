import { PMTilesSource } from "@loaders.gl/pmtiles";
import { color } from "d3-color";
import { scaleQuantize } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { CompositeLayer } from "deck.gl";

import DelaunayLayer from "./DelaunayLayer";

export default class DataTileLayer extends CompositeLayer {
  initializeState() {
    const source = new PMTilesSource({
      url: "http://localhost:5173/mesan.pmtiles",
    });

    const viewTiles = this.getTileCoordinates(
      this.context.viewport.getBounds(),
      this.context.viewport.zoom,
    );
    viewTiles.zoom = viewTiles.zoom > 10 ? 10 : viewTiles.zoom;
    const tiles = {};

    const ldata = this.getAllTiles(source, tiles, viewTiles);

    this.setState({
      source: source,
      storage: {},
      viewTiles,
      ldata,
      tiles,
    });
  }

  updateState() {
    const viewTiles = this.getTileCoordinates(
      this.context.viewport.getBounds(),
      Math.floor(this.context.viewport.zoom),
    );

    const reload = this.reloadData(viewTiles, this.state.viewTiles);
    if (reload.tiles == true || reload.zoom == true) {
      viewTiles.zoom = viewTiles.zoom > 10 ? 10 : viewTiles.zoom;

      const ldata = this.getAllTiles(
        this.state.source,
        this.state.tiles,
        viewTiles,
      );
      this.clearTiles(this.state.tiles, viewTiles);

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
          return [...this.hexToRGB(interpolateYlOrRd(q(x))), this.props.alpha];
          //return [...hexToRGB(interpolateYlOrRd((x + 30) / 50)), 200];
        },
        updateTriggers: {
          colorScale: [this.props.alpha],
        },
      }),
    ];
  }

  hexToRGB(hex) {
    const c = color(hex);
    return [c.r, c.g, c.b];
  }

  lon2tile(lon, zoom) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  }
  lat2tile(lat, zoom) {
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

  getTilesInViewport(viewport, zoom) {
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

  async getMetadata(source) {
    return await source.getMetadata();
  }

  getTileCoordinates(boundingBox, zoom) {
    const minX = this.lon2tile(boundingBox[0], zoom);
    const maxX = this.lon2tile(boundingBox[2], zoom);
    const maxY = this.lat2tile(boundingBox[1], zoom);
    const minY = this.lat2tile(boundingBox[3], zoom);

    return { minX, maxX, minY, maxY, zoom };
  }

  async getAllTiles(source, tiles, viewTiles) {
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

  clearTiles(tiles, viewTiles) {
    const keepKeys = [];
    for (let i = viewTiles.minY - 2; i <= viewTiles.maxY + 2; i++) {
      for (let j = viewTiles.minX - 2; j <= viewTiles.maxX + 2; j++) {
        keepKeys.push(`${j}${i}${viewTiles.zoom}`);
      }
    }

    for (const key in tiles) {
      if (tiles.hasOwnProperty(key)) {
        if (!keepKeys.includes(key)) {
          delete tiles[key];
        }
      }
    }
  }

  reloadData(viewTiles, oldViewTiles) {
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

DataTileLayer.layerName = "DataTileLayer";
