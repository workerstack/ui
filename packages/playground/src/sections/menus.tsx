import type { JSX } from "@solidjs/web";
import { buttonClass } from "@workerstack/ui/components/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@workerstack/ui/components/menu";
import { createSignal } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { Filterable, LabelsAndLinks } from "./menus-more.tsx";

function ActionItems(): JSX.Element {
  return (
    <MenuContent>
      <MenuItem value="rename">
        Rename <MenuShortcut>F2</MenuShortcut>
      </MenuItem>
      <MenuItem value="duplicate">
        Duplicate <MenuShortcut>⌘D</MenuShortcut>
      </MenuItem>
      <MenuSub>
        <MenuSubTrigger>Share</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="link">Copy link</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuItem value="archive" disabled>
        Archive
      </MenuItem>
      <MenuSeparator />
      <MenuItem value="delete" variant="destructive">
        Delete <MenuShortcut>⌫</MenuShortcut>
      </MenuItem>
    </MenuContent>
  );
}

function Actions(): JSX.Element {
  const log = useLog();

  return (
    <Example label="Actions">
      <Menu onAction={(value) => log("Menu", value)}>
        <MenuTrigger class={buttonClass({ variant: "outline" })}>Actions</MenuTrigger>
        <ActionItems />
      </Menu>
    </Example>
  );
}

function Density(props: { value: string; onChange: (value: string) => void }): JSX.Element {
  return (
    <MenuGroup>
      <MenuGroupLabel>Density</MenuGroupLabel>
      <MenuRadioGroup value={props.value} onValueChange={(value) => props.onChange(value)}>
        <MenuRadioItem value="compact">Compact</MenuRadioItem>
        <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
        <MenuRadioItem value="spacious">Spacious</MenuRadioItem>
      </MenuRadioGroup>
    </MenuGroup>
  );
}

function WordWrap(props: { checked: boolean; onChange: (isChecked: boolean) => void }): JSX.Element {
  return (
    <MenuCheckboxItem value="wrap" checked={props.checked} onCheckedChange={(isChecked) => props.onChange(isChecked)}>
      Word wrap
    </MenuCheckboxItem>
  );
}

function CheckboxAndRadio(): JSX.Element {
  const log = useLog();
  const [isWrapped, setIsWrapped] = createSignal(true);
  const [density, setDensity] = createSignal("comfortable");

  function changeDensity(value: string): void {
    setDensity(value);
    log("Menu density", value);
  }

  return (
    <Example label="Checkbox and radio">
      <Menu>
        <MenuTrigger class={buttonClass({ variant: "outline" })}>View</MenuTrigger>
        <MenuContent>
          <WordWrap
            checked={isWrapped()}
            onChange={(isChecked) => {
              setIsWrapped(isChecked);
              log("Menu wrap", isChecked);
            }}
          />
          <MenuSeparator />
          <Density value={density()} onChange={changeDensity} />
        </MenuContent>
      </Menu>
      <span class="self-center text-sm text-muted-foreground">
        wrap: {String(isWrapped())}, density: {density()}
      </span>
    </Example>
  );
}

/** Actions, a submenu, shortcuts, checkbox and radio items, links, and a filter. */
export function Menus(): JSX.Element {
  return (
    <Section
      id="menu"
      title="Menu"
      description="Actions, a submenu, shortcuts, checkbox and radio items, links, and a filter."
    >
      <Actions />
      <CheckboxAndRadio />
      <LabelsAndLinks />
      <Filterable />
    </Section>
  );
}
