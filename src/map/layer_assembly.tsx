import { MVTLoader } from "@loaders.gl/mvt";
import DataTileLayer from "./layers/datatile-layer.tsx";
import { MenuState } from "./types.tsx";

export function assembleMapLayers(state: MenuState, zoom: number) {
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
}

export function assembleDataLayers(state: MenuState) {
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
}
