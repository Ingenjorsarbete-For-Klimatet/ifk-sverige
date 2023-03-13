import React from "react";
import { createRoot } from "react-dom/client";

import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { MVTLayer } from "@deck.gl/geo-layers";

const COLOR = {
  "0_sverige": [127, 201, 127],
  "1_vatten": [56, 108, 176],
  "2_fjall": [255, 255, 153],
  "3_glaciar": [56, 108, 176],
  "4_oppen": [253, 192, 134],
  "5_stad": [0, 0, 0],
  "6_skog": [0, 50, 50],
};

const INITIAL_VIEW_STATE = {
  latitude: 62.5,
  longitude: 16,
  zoom: 4,
  minZoom: 4,
  maxZoom: 8,
  maxPitch: 0,
  bearing: 0,
};

const LONGITUDE_RANGE = [10, 20];
const LATITUDE_RANGE = [61, 64];

function onStateChange({ viewState }) {
  viewState.longitude = Math.min(
    LONGITUDE_RANGE[1],
    Math.max(LONGITUDE_RANGE[0], viewState.longitude)
  );
  viewState.latitude = Math.min(
    LATITUDE_RANGE[1],
    Math.max(LATITUDE_RANGE[0], viewState.latitude)
  );
  return viewState;
}

const devicePixelRatio =
  (typeof window !== "undefined" && window.devicePixelRatio) || 1;

const tileLayer = new MVTLayer({
  data: `/sverige/sweden_map_tiles/{z}/{x}/{y}.pbf`,

  //maxRequests: 20,

  //pickable: true,
  //onViewportLoad: onTilesLoad,
  //autoHighlight: showBorder,
  //highlightColor: [60, 60, 60, 40],
  // getLineColor: [192, 192, 192],
  getFillColor: (f) => COLOR[f.properties.layerName],
  //tileSize: 128,
  //zoomOffset: devicePixelRatio === 1 ? -2 : -2,

  stroked: true,
  //opacity: 0.5,
  //filled: true,
  //extruded: true,
  //pointType: 'circle',
  //lineWidthScale: 200,
  lineWidthMinPixels: 1,
  getLineColor: [0, 0, 0, 20],
  //getPointRadius: 100,
  //getLineWidth: 1,
  //getElevation: 30
});

export default function App({ showBorder = false, onTilesLoad = null }) {
  return (
    <DeckGL
      layers={[tileLayer]}
      views={new MapView({ repeat: false })}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      //onViewStateChange={onStateChange}
    ></DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
