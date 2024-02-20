import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import DeckGL from "deck.gl/typed";
import { Map, MapProvider } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { color } from "d3-color";
import { scaleQuantize } from "d3-scale";
import { MyLayer } from "./delaunay.tsx";
import DelaunayLayer from "./delaunay.tsx";
import { useMenuStore } from "./Store";
import { MVTLayer } from "@deck.gl/geo-layers";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";
import { MVTLoader } from "@loaders.gl/mvt";

import { PMTilesSource } from "@loaders.gl/pmtiles";

function lerp(a: number, b: number, alpha: number) {
  return a + alpha * (b - a);
}

function cartesianToWGS84(lngLat, boundingBox) {
  const [minX, maxY] = boundingBox[0];
  const [maxX, minY] = boundingBox[1];

  const [x, y] = lngLat;
  const x0 = lerp(minX, maxX, x);
  const y0 = lerp(minY, maxY, y);
  return [x0, y0];
}

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
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

const INITIAL_VIEW_STATE = {
  latitude: 62.5,
  longitude: 16,
  zoom: 4,
  minZoom: 4,
  maxZoom: 14,
};

export function App() {
  const [tmp, setTmp] = useState([]);
  const zoom = useMenuStore((state: any) => state.zoom);
  const setZoom = useMenuStore((state: any) => state.setZoom);
  const searchView = useMenuStore((state: any) => {
    if (state.searchView.zoom) {
      return state.searchView;
    } else {
      return INITIAL_VIEW_STATE;
    }
  });
  const [viewState, setViewState] = useState(searchView);

  // const step = 1;
  // const loopLength = 2500;
  // const [time, setTime] = useState(0);
  // const [z, setZ] = useState(0);
  // const [animation] = useState({});
  // const animate = () => {
  //   setTime((t) => (t + step) % loopLength);
  //   if (z > 13) {
  //     setZ(0);
  //   }
  //   setZ((t) => t + 1);
  //   setTimeout(() => {
  //     animation.id = window.requestAnimationFrame(animate); // draw next frame
  //   }, 100);
  // };
  // useEffect(() => {
  //   if (!true) {
  //     window.cancelAnimationFrame(animation.id);
  //     return;
  //   }

  //   animation.id = window.requestAnimationFrame(animate); // start animation
  //   return () => window.cancelAnimationFrame(animation.id);
  // }, [true]);

  // if (z > 12) {
  //   setZ(0);
  // }

  // console.log(z);

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
          "source-layer": state.layer[p].name,
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

  const layers2 = useMenuStore((state: any) => {
    const layers = [];

    layers.push(
      // @ts-ignore
      new MyLayer({
        id: "test",
        data: "http://localhost:5173/file_3/{z}/{x}/{y}.pbf",
        loaders: [MVTLoader],
        alpha: state.layer["Temperatur"].checked == true ? 200 : 0,
        // updateTriggers: {
        //   alpha: state.layer["Temperatur"].checked
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
        //console.log(viewState)

        // const {width, height } = viewState;

        // view.makeViewport({width, height, viewState})

        //console.log("viewstate", viewState)
        const viewport = viewState;
        //console.log("viewport", viewport)
        // const visibleData = this.getVisibleData(viewport); // Implement getVisibleData function
        // this.setState({ visibleData });

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
