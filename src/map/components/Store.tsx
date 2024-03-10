import { FlyToInterpolator } from "@deck.gl/core/typed";
import { create } from "zustand";

import { mapElements, MapElement } from "../config";

interface SearchView {
  latitude: number;
  longitude: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  pitch: number;
  bearing: number;
  transitionDuration: number;
  transitionInterpolator: Function;
}

export interface MenuState {
  zoom: number;
  theme: string;
  layer: Map<string, MapElement>;
  searchResult: {};
  searchView: SearchView;
  setZoom: (zoom: number) => void;
  setTheme: () => void;
  toggleLayer: (selectedLayer: string, checked: boolean) => void;
  setSearchResult: (result: any, fun: any) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  zoom: 4,
  theme: "light",
  layer: new Map(mapElements),
  searchResult: {},
  searchView: {},
  setZoom: (zoom: number) => {
    set(() => ({ zoom: zoom }));
  },
  setTheme: () => {
    set((state: any): any => ({
      theme: state.theme == "light" ? "dark" : "light",
    }));
  },
  toggleLayer: (selectedLayer: string, checked: boolean) =>
    set((state: any): any => ({
      layer: new Map(state.layer).set(selectedLayer, {
        ...state.layer.get(selectedLayer),
        ["checked"]: checked,
        ["color"]: checked
          ? mapElements.get(selectedLayer)!.color
          : [0, 0, 0, 0],
      }),
    })),
  setSearchResult: (result: any, fun: Function) => {
    const view = {
      latitude: result.geometry_xy[1],
      longitude: result.geometry_xy[0],
      zoom: 11,
      minZoom: 4,
      maxZoom: 14,
      pitch: 0,
      bearing: 0,
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator(),
    };
    fun(view);
    set(() => ({ searchResult: result, searchView: view }));
  },
}));
