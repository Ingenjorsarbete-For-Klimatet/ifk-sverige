import { renderToDOM, App } from "./App.tsx";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";

import "./styles.css";
import "maplibre-gl/dist/maplibre-gl.css";

renderToDOM(
  document.getElementById("root"),
  <div>
    <header>
      <Header />
    </header>
    <div id="map">
      <App />
    </div>
    <footer>
      <Footer />
    </footer>
  </div>,
);
