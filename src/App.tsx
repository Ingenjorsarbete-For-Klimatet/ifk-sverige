import { createRoot } from "react-dom/client";
import { useState, useEffect, useRef } from "react";
import "./styles.css";
import Map from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import { useMenuStore } from "./Store";

const INITIAL_VIEW_STATE = {
  latitude: 62.5,
  longitude: 16,
  zoom: 4,
  minZoom: 4,
  maxZoom: 14,
  maxPitch: 0,
  bearing: 0,
};

export function App() {
  const mapRef = useRef(null);

  const zoom = useMenuStore((state: any) => state.zoom);
  const setZoom = useMenuStore((state: any) => state.setZoom);
  const setSearchFlyFunction = useMenuStore(
    (state: any) => state.setSearchFlyFunction,
  );

  useEffect(() => {
    setSearchFlyFunction(mapRef);
    let protocol: any = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const layers = useMenuStore((state: any) => {
    let layers = [];

    for (const p in state.layer) {
      if (state.layer[p].type == "ground" && state.layer[p].checked == true) {
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
          },
        });
      }

      if (
        state.layer[p].type == "communication" &&
        state.layer[p].checked == true
      )
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
          },
        });
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
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW_STATE}
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
        },
        layers: layers,
      }}
      mapLib={maplibregl}
    />
  );
}

export function renderToDOM(container: any, component: any): any {
  createRoot(container).render(component);
}
