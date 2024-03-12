import "./styles.css";
import "maplibre-gl/dist/maplibre-gl.css";

import { App, renderToDOM } from "./components/App.tsx";
import { Footer } from "./components/Footer.tsx";
import { Header } from "./components/Header.tsx";

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
