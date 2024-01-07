import { createRoot } from "react-dom/client";
import { PMTLayer } from "@mgcth/deck.gl-pmtiles";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import DeckGL from "@deck.gl/react/typed";
import { FlyToInterpolator } from "@deck.gl/core/typed";
import { MapView } from "@deck.gl/core/typed";
import { useMenuStore, useSearchStore, buildLayerStore } from "./Menu.tsx";
import { useState, useCallback } from "react";

const STROKED: { [index: string]: any } = {
  Sverige: 1,

  "Anlagt vatten": 1,
  Vattendragsyta: 1,
  Sjö: 1,

  "Hög bebyggelse": 0,
  "Låg bebyggelse": 0,
  "Sluten bebyggelse": 0,
  "Industri- och handelsbebyggelse": 0,

  "Öppen mark": 0,
  "Barr- och blandskog": 0,
  Lövskog: 0,

  Fruktodling: 0,
  Åker: 0,

  Fjällbjörkskog: 0,
  Glaciär: 0,
  Kalfjäll: 0,
};

const COLOR: { [index: string]: any } = {
  Sverige: [160, 210, 180],

  "Anlagt vatten": [222, 244, 252],
  Vattendragsyta: [222, 244, 252],
  Sjö: [222, 244, 252],

  "Hög bebyggelse": [210, 210, 210],
  "Låg bebyggelse": [220, 220, 220],
  "Sluten bebyggelse": [230, 230, 230],
  "Industri- och handelsbebyggelse": [240, 240, 240],

  "Öppen mark": [155, 118, 83, 50],
  "Barr- och blandskog": [110, 177, 131],
  Lövskog: [45, 90, 39, 50],

  Fruktodling: [199, 55, 47, 50],
  Åker: [245, 222, 179, 50],

  Fjällbjörkskog: [99, 126, 29, 50],
  Glaciär: [0, 134, 1450, 100],
  Kalfjäll: [125, 200, 181, 100],

  Bostad: [30, 30, 30, 200],
  Ekonomibyggnad: [30, 30, 30, 200],
  Industri: [30, 30, 30, 200],
  Komplementbyggnad: [30, 30, 30, 200],
  Samhällsfunktion: [30, 30, 30, 200],
  Verksamhet: [30, 30, 30, 200],
  "Övrig byggnad": [30, 30, 30, 200],

  Motorväg: [255, 255, 255, 150],
  Motortrafikled: [255, 255, 255, 150],
  "Övergripande länk": [255, 255, 255, 150],
  Landsväg: [255, 255, 255, 150],
  "Landsväg liten": [255, 255, 255, 150],
  Huvudgata: [255, 255, 255, 150],
  "Lokalgata stor": [255, 255, 255, 150],
  "Lokalgata liten": [255, 255, 255, 150],
  "Mötesfri väg": [255, 255, 255, 150],
  Småväg: [255, 255, 255, 150],
  "Småväg enkel standard": [255, 255, 255, 150],
};

// const LONGITUDE_RANGE = [10, 20];
// const LATITUDE_RANGE = [61, 64];

/* global window */
//  const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

function getTooltip({ tile }: any) {
  if (tile) {
    const { x, y, z } = tile.index;
    return `tile: x: ${x}, y: ${y}, z: ${z}`;
  }
  return null;
}

// function onStateChange({viewState}: any) {
//     viewState.longitude = Math.min(LONGITUDE_RANGE[1], Math.max(LONGITUDE_RANGE[0], viewState.longitude));
//     viewState.latitude = Math.min(LATITUDE_RANGE[1], Math.max(LATITUDE_RANGE[0], viewState.latitude));
//     return viewState;
//   }

// function onViewStateChange({viewState}: any) {
//   console.log(viewState.zoom)
// }

const INITIAL_VIEW_STATE = {
  latitude: 62.5,
  longitude: 16,
  zoom: 4,
  minZoom: 4,
  maxZoom: 14,
  maxPitch: 0,
  bearing: 0,
};

const allLayers = buildLayerStore(true);

export function App() {
  const searchView = useSearchStore((state: any) => {
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

  // const layers = Object.entries(useMenuStore((state: any) => state.layer))
  //   .filter(([_, value]) => value == true)
  //   .map(([key, _]) => key)

  // console.log(layers)

  // const GroundLayer = new PMTLayer({
  //   id: "ground-layer",
  //   data: "sweden_ground.pmtiles",
  //   pickable: true,
  //   // @ts-ignore
  //   getFillColor: (f: any) => COLOR[f.properties.objekttyp],
  //   stroked: true,
  //   lineWidthMinPixels: (f: any) => STROKED[f.properties.objekttyp],
  //   getLineColor: [0, 0, 0, 20],
  //   // loadOptions: {
  //   //   mvt: {
  //   //     layers: layers
  //   //   }
  //   // },
  //   // updateTriggers: {
  //   //   loadOptions: { mvt: layers }
  //   // }
  // });

  // // {const GroundLayer = new PMTLayer({
  // //   id: "ground-layer",
  // //   data: "sweden_ground.pmtiles",
  // //   pickable: true,
  // //   // @ts-ignore
  // //   getFillColor: (f: any) => COLOR[f.properties.objekttyp],
  // //   stroked: true,
  // //   lineWidthMinPixels: (f: any) => STROKED[f.properties.objekttyp],
  // //   getLineColor: [0, 0, 0, 20],
  // //   loadOptions: {
  // //     mvt: {
  // //       layers: layers
  // //     }
  // //   },
  // //   updateTriggers: {
  // //     loadOptions: [mvt.layers]
  // //   }
  // // });}

  // const BuildingLayer = new PMTLayer({
  //   id: "building-layer",
  //   data: "sweden_building.pmtiles",
  //   //getFillColor: function(f) {
  //   //  COLOR[f.properties.objekttyp]
  //   //},
  //   // @ts-ignore
  //   getFillColor: (f: any) => COLOR[f.properties.objekttyp],
  //   stroked: false,
  //   lineWidthMinPixels: 1,
  //   getLineColor: [0, 0, 0, 20],
  // });

  // const RoadLayer = new PMTLayer({
  //   id: "road-layer",
  //   data: "sweden_road.pmtiles",
  //   // @ts-ignore
  //   getLineColor: (f: any) => COLOR[f.properties.objekttyp],
  //   stroked: true,
  //   lineWidthMinPixels: 2,
  // });

  // const TextLayer = new PMTLayer({
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
  // });

  return (
    <DeckGL
      layers={layers}
      views={new MapView({ repeat: false })}
      initialViewState={searchView}
      controller={true}
      getTooltip={getTooltip}
      //onViewStateChange={goToSearchLocation}
    ></DeckGL>
  );
}

export function renderToDOM(container: any, component: any): any {
  createRoot(container).render(component);
}
