import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import DeckGL from "deck.gl/typed";
import { Map, MapProvider } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { color } from "d3-color";
import { MyCompositeLayer } from "./delaunay.tsx";
import DelaunayLayer from "./delaunay.tsx";
import { useMenuStore } from "./Store";
import { MVTLayer } from "@deck.gl/geo-layers";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";

import { PMTilesSource } from "@loaders.gl/pmtiles";
import { MVTLoader } from "@loaders.gl/mvt";
import { PMTLoader } from "@mgcth/deck.gl-pmtiles";

import { TileLayer } from "@deck.gl/geo-layers";

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

  function hexToRGB(hex) {
    const c = color(hex);
    return [c.r, c.g, c.b];
  }

  const lays = [
    new TileLayer({
      data: "http://localhost:5173/file_2/{z}/{x}/{y}.pbf",
      id: "composite",
      maxZoom: 8,
      loaders: [MVTLoader],
      loadOptions: { worker: false },
      binary: false,
      renderSubLayers: (props) => {
        // console.log(props.data)
        // const udata = []
        // if (props.data) {
        //   for (let i = 0; i < props.data.points.properties.length; i++) {
        //     const c = props.data.points.properties[i].c
        //       .replace("[", "")
        //       .replace("]", "")
        //       .split(",").map((x => Number(x)))

        //     const t = props.data.points.properties[i].t
        //       .replace("[", "")
        //       .replace("]", "")
        //       .split(",").map((x => Number(x)))

        //     const time = props.data.points.properties[i].time
        //       .replace("[", "")
        //       .replace("]", "")
        //       .split(",").map((x => Number(x)))

        //       udata.push({c: c, t: t, time: time})
        //   }
        // }

        // console.log(udata)

        const { id } = props;
        //console.log(props)

        return (
          // @ts-ignore
          new DelaunayLayer({
            ...props,
            id: id + "c",
            getPosition: (d) => {
              let val = d.properties.c
                .replace("[", "")
                .replace("]", "")
                .split(",")
                .map((e) => Number(e));
              //console.log(val)
              return val;
            },
            getValue: (d) => {
              let val = d.properties.t
                .replace("[", "")
                .replace("]", "")
                .split(",")
                .map((e) => Number(e))[0];
              return val;
            },
            colorScale: (x) => {
              let val = [...hexToRGB(interpolateYlOrRd((x + 30) / 50)), 200];
              return val;
            },
          })
          // new GeoJsonLayer({
          //   ...props,
          //   id: id + 'geojson-layer',
          //   pointType: 'circle',
          //   getFillColor: (e) => {
          //     //console.log(e)
          //     return [160, 160, 180, 200]
          //   },
          //   getPointRadius: 100,
          //   pointRadiusMinPixels: 1,
          //   pointRadiusMaxPixels: 10,
          // })
        );
      },
    }),

    // new MyCompositeLayer({
    //   id: "f",
    //   data: "file_2.pmtiles",
    //   loaders: [PMTLoader],
    //   loadOptions: {worker: false}
    // }),

    // @ts-ignore
    new DelaunayLayer({
      id: "c",
      data: "file_2.pmtiles",
      getPosition: (d) => d.c,
      getValue: (d) => {
        return d.d;
      },
      colorScale: (x) => {
        return [...hexToRGB(interpolateYlOrRd((x + 30) / 50)), 200];
      },
      loaders: [PMTLoader],
      loadOptions: { worker: false },
    }),

    // new MVTLayer({
    //   data: `file_2/{z}/{x}/{y}.pbf`,

    //   minZoom: 0,
    //   maxZoom: 23,
    //   getFillColor: f => {
    //     console.log(f)
    //     return [100, 100, 100]
    //   },
    // })

    // new ScatterplotLayer({
    //   data: "file_2.json",
    //   id: "c",
    //   radiusMinPixels: 100,
    //   radiusMaxPixels: 100,
    //   getFillColor: d => {
    //     console.log(d.t[0])
    //     return [d.t[0]+100, d.t[0]+100, d.t[0]+100]
    //   },
    //   // // props added by DataFilterExtension
    //   // getFilterValue: f => {
    //   //   return f.time
    //   // },  // in seconds
    //   // filterRange: [0, 1],  // 12:00 - 13:00

    //   // // Define extensions
    //   // extensions: [new DataFilterExtension({filterSize: 1})]
    // }),

    // new ScatterplotLayer({
    //   id: 'scatterplot-layer',
    //   data: 'file.json',
    //   pickable: true,
    //   opacity: 0.6,
    //   filled: true,
    //   radiusScale: 6,
    //   radiusMinPixels: 1,
    //   radiusMaxPixels: 100,
    //   lineWidthMinPixels: 1,
    //   getPosition: d => d.c,
    //   getRadius: d => Math.sqrt(d.exits),
    //   getFillColor: d => [d.d*100, d.d*100, d.d*100],
    // })
  ];

  return (
    <DeckGL
      initialViewState={searchView}
      layers={lays}
      controller={{ inertia: 300, scrollZoom: { speed: 0.1, smooth: true } }}
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
