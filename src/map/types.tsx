import { FlyToInterpolator } from "@deck.gl/core";
// @ts-ignore
import { PMTilesSource } from "@loaders.gl/pmtiles";
import { ThemeOptions } from "@radix-ui/themes";

export interface MapElement {
  name: string;
  color: number[];
  dark_color: number[];
  type: string;
  checked: boolean;
  stroke: number;
}

export interface SearchResult {
  textstrang: string;
  textkategori: string;
  geometry_xy: number[];
}

export interface SearchView {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  bearing?: number;
  transitionDuration?: number;
  transitionInterpolator?: FlyToInterpolator;
}

export interface MenuState {
  zoom: number;
  theme: ThemeOptions["appearance"];
  layer: Map<string, MapElement>;
  searchResult: SearchResult;
  searchView: SearchView;
  setZoom: (zoom: number) => void;
  setTheme: () => void;
  toggleLayer: (selectedLayer: string, checked: boolean) => void;
  setSearchResult: (
    result: SearchResult,
    fun: (...args: unknown[]) => void,
  ) => void;
}

export interface ViewTile {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  zoom: number;
}

export interface Reload {
  tiles: boolean;
  zoom: boolean;
}

export interface DataLayerState {
  source: PMTilesSource;
  storage: Map<string, Promise<unknown>>;
  viewTiles: ViewTile;
  ldata: any;
  tiles: any;
}

export type DataTileMap = Map<string, unknown>;
