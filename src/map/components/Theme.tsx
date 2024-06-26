import { Button } from "@radix-ui/themes";

import { MenuState } from "../types.tsx";
import { useMenuStore } from "./Store";

export function ThemeButton() {
  const theme = useMenuStore((state: MenuState) => state.theme);
  const setTheme = useMenuStore((state: MenuState) => state.setTheme);
  const icon = theme == "light" ? "light_mode" : "dark_mode";

  return (
    <Button size="3" variant="surface" className={theme} onClick={setTheme}>
      <span className="material-symbols-outlined">{icon}</span>
    </Button>
  );
}
