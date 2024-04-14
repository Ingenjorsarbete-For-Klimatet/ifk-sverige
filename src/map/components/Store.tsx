import { FlyToInterpolator } from "@deck.gl/core/typed";
import { create } from "zustand";

import { mapElements } from "../config";
import { MenuState, SearchResult, SearchView } from "../types";

export const useMenuStore = create<MenuState>((set) => ({
  zoom: 4,
  theme: "light",
  layer: new Map(mapElements),
  searchResult: {
    textstrang: "",
    textkategori: "",
    geometry_xy: [],
  } as SearchResult,
  searchView: {} as SearchView,
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
  setSearchResult: (result: SearchResult, fun: Function) => {
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
    } as SearchView;
    fun(view);
    set(() => ({ searchResult: result }));
    set(() => ({ searchView: view }));
  },
}));
