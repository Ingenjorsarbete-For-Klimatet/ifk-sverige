import { create } from "zustand";
import { mapElements } from "./config";
import { FlyToInterpolator } from "@deck.gl/core/typed";

export const useMenuStore = create((set) => ({
  zoom: 4,
  theme: "light",
  layer: structuredClone(mapElements),
  searchResult: {},
  searchView: {},
  searchFlyFunction: () => {},
  setSearchFlyFunction: (fun: any) => {
    set(() => ({ searchFlyFunction: fun }));
  },
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
      layer: {
        ...state.layer,
        [selectedLayer]: {
          ...state.layer[selectedLayer],
          ["checked"]: checked,
          ["color"]: checked ? mapElements[selectedLayer].color : [0, 0, 0, 0],
        },
      },
    })),
  setSearchResult: (result: any, fun: any) => {
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
