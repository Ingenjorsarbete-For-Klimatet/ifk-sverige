import { Button } from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useMenuStore } from "../Header.tsx";

export function ThemeButton() {
  const theme = useMenuStore((state: any) => state.theme);
  const setTheme = useMenuStore((state: any) => state.setTheme);
  console.log(theme);
  const icon = theme == "light" ? <SunIcon /> : <MoonIcon />;

  return (
    <Button size="3" variant="surface" className={theme} onClick={setTheme}>
      {icon}
    </Button>
  );
}
