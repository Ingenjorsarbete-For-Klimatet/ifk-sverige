import { assembleMapLayers, assembleDataLayers } from "../layer_assembly.tsx";
import DeckGL from "deck.gl";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Map, MapProvider } from "react-map-gl/maplibre";

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

  const mapLayers = useMenuStore((state: MenuState) => {
    return assembleMapLayers(state, zoom);
  });

  const dataLayers = useMenuStore((state: MenuState) => {
    return assembleDataLayers(state);
  });

  return (
    <DeckGL
      initialViewState={searchView}
      layers={dataLayers}
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
          layers: mapLayers,
        }}
      />
    </DeckGL>
  );
}

export function renderToDOM(container: any, component: any): any {
  createRoot(container).render(component);
}
