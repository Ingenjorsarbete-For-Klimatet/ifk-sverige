import { createRoot } from "react-dom/client";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";
import DeckGL from "@deck.gl/react/typed";
import { MapView } from "@deck.gl/core/typed";
import { useMenuStore, buildLayerStore } from "./Menu.tsx";
import { STROKED, COLOR } from "./config.tsx";

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
    const ground = Object.entries(state.layer["ground"])
      .filter(([_, value]) => value == true)
      .map(([key, _]) => key);
    const road = Object.entries(state.layer["road"])
      .filter(([_, value]) => value == true)
      .map(([key, _]) => key);
    const construction = Object.entries(state.layer["construction"])
      .filter(([_, value]) => value == true)
      .map(([key, _]) => key);

    let layers = [];

    layers.push(
      new PMTLayer({
        id: "ground-layer",
        data: "sweden_ground.pmtiles",
        pickable: true,
        // @ts-ignore
        getFillColor: (f: any) => COLOR[f.properties.objekttyp],
        stroked: true,
        lineWidthMinPixels: (f: any) => STROKED[f.properties.objekttyp],
        getLineColor: [0, 0, 0, 20],
        loadOptions: {
          mvt: {
            layers: ground,
          },
        },
      }),
    );

    layers.push(
      new PMTLayer({
        id: "road-layer",
        data: "sweden_road.pmtiles",
        // @ts-ignore
        getLineColor: (f: any) => COLOR[f.properties.objekttyp],
        stroked: true,
        lineWidthMinPixels: 2,
        loadOptions: {
          mvt: {
            layers: road,
          },
        },
      }),
    );

    layers.push(
      new PMTLayer({
        id: "building-layer",
        data: "sweden_building.pmtiles",
        // @ts-ignore
        getFillColor: [(f: any) => COLOR[f.properties.objekttyp]],
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

    // layers.push(new PMTLayer({
    //   id: "text-layer",
    //   data: "sweden_text.pmtiles",
    //   // @ts-ignore
    //   pointType: "text",
    //   // @ts-ignore
    //   getText: (f) => f.properties.textstrang,
    //   getTextSize: 10,
    //   characterSet: ["\u00E5", "\u00E4", "\u00F6"],
    //   //textOutlineColor: [0, 0, 0, 255],
    //   //textOutlineWidth: 2,
    //   getTextColor: [0, 0, 0],
    // }))

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
