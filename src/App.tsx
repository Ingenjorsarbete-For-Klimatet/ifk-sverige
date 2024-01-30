import { createRoot } from "react-dom/client";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";
import DeckGL from "@deck.gl/react/typed";
import { MapView } from "@deck.gl/core/typed";
import { useMenuStore } from "./Header.tsx";
import { mapElements } from "./config.tsx";

function getTooltip({ tile }: any) {
  if (tile) {
    const { x, y, z } = tile.index;
    return `tile: x: ${x}, y: ${y}, z: ${z}`;
  }
  return null;
}

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
  const searchView = useMenuStore((state: any) => {
    if (state.searchView.zoom) {
      return state.searchView;
    } else {
      return INITIAL_VIEW_STATE;
    }
  });

  const layers = useMenuStore((state: any) => {
    let layers = [];

    const ground: { [index: string]: any } = {};
    const communication: { [index: string]: any } = {};
    for (const p in state.layer) {
      if (state.layer[p].type == "ground") {
        ground[p] = state.layer[p];
      }

      if (state.layer[p].type == "communication") {
        communication[p] = state.layer[p];
      }
    }

    layers.push(
      new PMTLayer({
        id: "ground-layer",
        data: "sweden_ground.pmtiles",
        pickable: true,
        // @ts-ignore
        getFillColor: (f: any) => ground[f.properties.objekttyp].color,
        stroked: true,
        lineWidthMinPixels: (f: any) => ground[f.properties.objekttyp].stroke,
        getLineColor: [0, 0, 0, 20],
        loadOptions: {
          mvt: {
            layers: Object.entries(ground)
              .filter(([_, value]) => value["checked"] == true)
              .map(([_, value]) => value.name),
          },
        },
        updateTriggers: {
          getFillColor: ground,
        },
      }),
    );

    layers.push(
      new PMTLayer({
        id: "communication-layer",
        data: "sweden_road.pmtiles",
        // @ts-ignore
        pointType: "text",
        // @ts-ignore
        getLineColor: (f: any) => communication[f.properties.objekttyp].color,
        getText: (f: any) => f.properties.vardvagnummer,
        stroked: true,
        strokeColor: [255, 0, 0],
        strokeWeight: 2,
        lineWidthMinPixels: 2,
        loadOptions: {
          mvt: {
            layers: Object.entries(communication)
              .filter(([_, value]) => value["checked"] == true)
              .map(([_, value]) => value.name),
          },
        },
        updateTriggers: {
          getLineColor: communication,
        },
        getTextSize: 12,
        textCharacterSet: "auto",
        textFontFamily: "Helvetica",
        getTextColor: [0, 0, 0],
        textOutlineColor: [255, 255, 255, 200],
        textOutlineWidth: 1,
        textFontSettings: { sdf: true },
      }),
    );

    layers.push(
      new PMTLayer({
        id: "building-layer",
        data: "sweden_building.pmtiles",
        // @ts-ignore
        getFillColor: [(f: any) => mapElements[f.properties.objekttyp]],
        stroked: false,
        lineWidthMinPixels: 1,
        getLineColor: [0, 0, 0, 20],
        loadOptions: {
          mvt: {
            layers: ["100_bygg"],
          },
        },
      }),
    );

    layers.push(
      new PMTLayer({
        id: "text-layer",
        data: "sweden_text.pmtiles",
        // @ts-ignore
        pointType: "text",
        // @ts-ignore
        getText: (f) => f.properties.textstrang,
        getTextSize: 12,
        textCharacterSet: "auto",
        textFontFamily: "Helvetica",
        getTextColor: [0, 0, 0],
        textOutlineColor: [255, 255, 255, 200],
        textOutlineWidth: 10,
        textFontSettings: { sdf: true },
      }),
    );

    return layers;
  });

  return (
    <DeckGL
      layers={layers}
      views={new MapView({ repeat: false })}
      initialViewState={searchView}
      controller={true}
      getTooltip={getTooltip}
    ></DeckGL>
  );
}

export function renderToDOM(container: any, component: any): any {
  createRoot(container).render(component);
}
