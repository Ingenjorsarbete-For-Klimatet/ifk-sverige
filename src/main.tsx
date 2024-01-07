import * as React from "react";

import { renderToDOM, App } from "./App.tsx";
import { MainMenu } from "./Menu.tsx";
import "../app/globals.css";
import "./App.css";

renderToDOM(
  document.getElementById("root"),
  <div>
    <div id="nav">
      <MainMenu />
    </div>
    <div id="map">
      <App />
    </div>
  </div>,
);
