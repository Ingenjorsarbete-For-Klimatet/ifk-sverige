import { renderToDOM, App } from "./App.tsx";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./App.css";

renderToDOM(
  document.getElementById("root"),
  <div>
    <header>
      <Theme
        accentColor="gray"
        grayColor="mauve"
        panelBackground="translucent"
        scaling="100%"
        radius="medium"
      >
        <Header />
      </Theme>
    </header>
    <div id="map">
      <App />
    </div>
    <footer>
      <Theme
        accentColor="gray"
        grayColor="mauve"
        panelBackground="translucent"
        scaling="100%"
        radius="medium"
      >
        <Footer />
      </Theme>
    </footer>
  </div>,
);
