import { MVTLoader } from "@loaders.gl/mvt";
import DeckGL from "deck.gl";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Map, MapProvider } from "react-map-gl";

import DataTileLayer from "../layers/datatile-layer.tsx";
import { MenuState, SearchView } from "../types.tsx";
import { useMenuStore } from "./Store.tsx";

const INITIAL_VIEW_STATE = {
  latitude: 62.5,
  longitude: 16,
  zoom: 4,
  minZoom: 4,
  maxZoom: 14,
} as SearchView;

export function App() {
  const zoom = useMenuStore((state: MenuState) => state.zoom);
  const setZoom = useMenuStore((state: MenuState) => state.setZoom);
  const searchView = useMenuStore((state: MenuState) => {
    if (state.searchView.zoom) {
      return state.searchView;
    } else {
      return INITIAL_VIEW_STATE;
    }
  });

  useEffect(() => {
    const protocol: any = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const layers = useMenuStore((state: MenuState) => {
    const layers = [];

    for (const [p, _] of state.layer) {
      if (
        state.layer.get(p)!.type == "ground" &&
        state.layer.get(p)!.checked == true
      ) {
        let opacity = 1;
        if (
          p == "Sverige" ||
          p == "Sjö" ||
          p == "Anlagt vatten" ||
          p == "Vattendragsyta"
        ) {
          opacity = 1;
        } else if (p == "Kalfjäll" || p == "Fjällbjörkskog") {
          opacity = Math.pow(zoom, 2) / 50;
        } else {
          opacity = Math.pow(zoom, 2) / 150;
        }

        opacity = opacity > 1 ? 1 : opacity;

        layers.push({
          id: p,
          source: "ground",
          "source-layer": state.layer.get(p)!.name,
          type: "fill",
          paint: {
            "fill-color":
              state.theme == "light"
                ? state.layer.get(p)!.color
                : state.layer.get(p)!.dark_color,
            "fill-opacity": opacity,
          },
        });
      }

      if (
        state.layer.get(p)!.type == "communication" &&
        state.layer.get(p)!.checked == true
      ) {
        let line_width = 2;
        let line_blur = 1;
        let line_gap_width = 0;

        if (zoom >= 8 && (p == "Motorväg" || p == "Motortrafikled")) {
          line_width = 4;
          line_blur = 1;
        }

        if (zoom >= 12 && (p == "Motorväg" || p == "Motortrafikled")) {
          line_gap_width = 1;
        }

        layers.push({
          id: `${p}_outline`,
          source: "connection",
          "source-layer": state.layer.get(p)!.name,
          type: "line",
          paint: {
            "line-color": state.theme == "light" ? "#000" : "#fff",
            "line-width": line_width + 1,
            "line-blur": line_blur,
            "line-gap-width": line_gap_width,
          },
        });
        layers.push({
          id: p,
          source: "connection",
          "source-layer": state.layer.get(p)!.name,
          type: "line",
          paint: {
            "line-color":
              state.theme == "light"
                ? state.layer.get(p)!.color
                : state.layer.get(p)!.dark_color,
            "line-width": line_width,
            "line-gap-width": line_gap_width,
          },
        });
      }
    }

    layers.push({
      id: "bygg",
      source: "construction",
      "source-layer": "100_bygg",
      type: "fill",
      paint: {
        "fill-color": "#000000",
      },
    });

    // layers.push({
    //   id: "terrain",
    //   source: "terrain",
    //   type: "hillshade",
    //   paint: {
    //     "hillshade-exaggeration": 1,
    //   },
    //   layout: {
    //     visibility: "visible",
    //   },
    // });

    layers.push({
      id: "text",
      source: "text",
      "source-layer": "sweden_text",
      type: "symbol",
      paint: {
        "text-color": state.theme == "light" ? "#000000" : "#ffffff",
        "text-halo-color": state.theme == "light" ? "#ffffff" : "#000000",
        "text-halo-width": 1,
      },
      layout: {
        "text-field": ["get", "textstrang"],
        "text-radial-offset": 0.5,
        "text-size": 12,
      },
    });

    return layers;
  });

  const layers2 = useMenuStore((state: MenuState) => {
    const layers = [];

    layers.push(
      new DataTileLayer({
        id: "test",
        data: "http://localhost:5173/mesan.pmtiles",
        loaders: [MVTLoader],
        alpha: state.layer.get("Temperatur")!.checked == true ? 200 : 0,
        // updateTriggers: {
        //   alpha: state.layer.get("Temperatur")?.checked
        // }
      }),
    );

    return layers;
  });

  return (
    <DeckGL
      initialViewState={searchView}
      layers={layers2}
      controller={{ inertia: 500, scrollZoom: { speed: 0.2, smooth: false } }}
      ContextProvider={MapProvider}
      onViewStateChange={({ viewState }) => {
        setZoom(viewState.zoom);

        return {
          ...viewState,
        };
      }}
    >
      <Map
        style={{ width: "100vw", height: "100vh", margin: "0 auto" }}
        mapStyle={{
          version: 8,
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
          sources: {
            ground: {
              type: "vector",
              url: "pmtiles://sweden_ground.pmtiles",
            },
            connection: {
              type: "vector",
              url: "pmtiles://sweden_road.pmtiles",
            },
            construction: {
              type: "vector",
              url: "pmtiles://sweden_building.pmtiles",
            },
            text: {
              type: "vector",
              url: "pmtiles://sweden_text.pmtiles",
            },
            // terrain: {
            //   type: "raster-dem",
            //   url: "pmtiles://output.pmtiles",
            //   tileSize: 512,
            // },
          },
          // terrain: {
          //   source: "terrain",
          //   exaggeration: 2,
          // },
          // @ts-ignore
          layers: layers,
        }}
        // @ts-ignore
        mapLib={maplibregl}
      />
    </DeckGL>
  );
}

export function renderToDOM(container: any, component: any): any {
  createRoot(container).render(component);
}
