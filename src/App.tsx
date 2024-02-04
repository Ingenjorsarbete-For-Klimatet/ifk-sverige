import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import DeckGL from "deck.gl/typed";
import { Map, MapProvider } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

import { useMenuStore } from "./Store";

const INITIAL_VIEW_STATE = {
  latitude: 62.5,
  longitude: 16,
  zoom: 4,
  minZoom: 4,
  maxZoom: 14,
};

export function App() {
  const zoom = useMenuStore((state: any) => state.zoom);
  const setZoom = useMenuStore((state: any) => state.setZoom);
  const searchView = useMenuStore((state: any) => {
    if (state.searchView.zoom) {
      return state.searchView;
    } else {
      return INITIAL_VIEW_STATE;
    }
  });

  useEffect(() => {
    let protocol: any = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const layers = useMenuStore((state: any) => {
    let layers: any = [];

    for (const p in state.layer) {
      if (state.layer[p].type == "ground" && state.layer[p].checked == true) {
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
          "source-layer": state.layer[p].name,
          type: "fill",
          paint: {
            "fill-color":
              state.theme == "light"
                ? state.layer[p].color
                : state.layer[p].dark_color,
            "fill-opacity": opacity,
          },
        });
      }

      if (
        state.layer[p].type == "communication" &&
        state.layer[p].checked == true
      ) {
        let line_width = 1;
        let line_blur = 1;
        let line_gap_width = 0;

        if (zoom >= 8 && (p == "Motorväg" || p == "Motortrafikled")) {
          line_width = 2;
          line_blur = 1;
          line_gap_width = 0;
        }

        layers.push({
          id: `${p}_outline`,
          source: "connection",
          "source-layer": state.layer[p].name,
          type: "line",
          paint: {
            "line-color": state.theme == "light" ? "#000" : "#fff",
            "line-width": line_width,
            "line-blur": line_blur,
            "line-gap-width": line_gap_width,
          },
        });
        layers.push({
          id: p,
          source: "connection",
          "source-layer": state.layer[p].name,
          type: "line",
          paint: {
            "line-color":
              state.theme == "light"
                ? state.layer[p].color
                : state.layer[p].dark_color,
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

    layers.push({
      id: "terrain",
      source: "terrain",
      type: "hillshade",
      paint: {
        "hillshade-exaggeration": 0.1,
      },
      layout: {
        visibility: "none",
      },
    });

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

  return (
    <DeckGL
      initialViewState={searchView}
      controller={{ inertia: 300, scrollZoom: { speed: 1, smooth: true } }}
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
            terrain: {
              type: "raster-dem",
              url: "pmtiles://output.pmtiles",
              tileSize: 512,
            },
          },
          // terrain: {
          //   source: "terrain",
          //   exaggeration: 0.001,
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
