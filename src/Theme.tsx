import { Button } from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useMenuStore } from "./Store";

export function ThemeButton() {
  const theme = useMenuStore((state: any) => state.theme);
  const setTheme = useMenuStore((state: any) => state.setTheme);
  const icon = theme == "light" ? "light_mode" : "dark_mode";

  return (
    <Button size="3" variant="surface" className={theme} onClick={setTheme}>
      <span className="material-symbols-outlined">{icon}</span>
    </Button>
  );
}
