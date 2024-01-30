import { Button, Flex, Popover } from "@radix-ui/themes";
import { InfoCircledIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";

import { ThemeButton } from "./utils/theme";

export function Footer() {
  return (
    <Flex gap="2">
      <ThemeButton />
      <Popover.Root>
        <Popover.Trigger>
          <Button size="3" variant="surface">
            <InfoCircledIcon />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          Karta över Sverige. Data från Lantmäteriet.
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <Button size="3" variant="surface">
            <EnvelopeClosedIcon />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <a href="mailto:info@ingenjorsarbeteforklimatet.se">Kontakta oss</a>.
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}
