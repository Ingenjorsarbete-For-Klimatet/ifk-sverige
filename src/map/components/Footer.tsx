import { Button, Flex, Popover } from "@radix-ui/themes";
import { Theme } from "@radix-ui/themes";

import { MenuState, useMenuStore } from "./Store";
import { ThemeButton } from "./Theme";

export function Footer() {
  const theme = useMenuStore((state: MenuState) => state.theme);

  return (
    <Theme
      accentColor="gray"
      grayColor="mauve"
      panelBackground="translucent"
      scaling="100%"
      radius="medium"
      appearance={theme}
    >
      <Flex gap="2">
        <ThemeButton />
        <Popover.Root>
          <Popover.Trigger>
            <Button size="3" variant="surface">
              <span className="material-symbols-outlined">info</span>
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            Karta över Sverige. Data från Lantmäteriet.
          </Popover.Content>
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger>
            <Button size="3" variant="surface">
              <span className="material-symbols-outlined">mail</span>
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <a href="mailto:info@ingenjorsarbeteforklimatet.se">Kontakta oss</a>
            .
          </Popover.Content>
        </Popover.Root>
      </Flex>
    </Theme>
  );
}
