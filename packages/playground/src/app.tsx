import type { JSX } from "@solidjs/web";
import { Button } from "@workerstack/ui/button";
import { Toaster } from "@workerstack/ui/toast";
import { cn } from "cn";
import { createSignal, For } from "solid-js";

import { EventLog, LogProvider } from "./log.tsx";
import { THEME_KEY } from "./playground.constants.ts";
import { AlertDialogs } from "./sections/alert-dialogs.tsx";
import { Badges } from "./sections/badges.tsx";
import { Buttons } from "./sections/buttons.tsx";
import { Cards } from "./sections/cards.tsx";
import { Checkboxes } from "./sections/checkboxes.tsx";
import { Comboboxes } from "./sections/comboboxes.tsx";
import { Dialogs } from "./sections/dialogs.tsx";
import { Drawers } from "./sections/drawers.tsx";
import { Fields } from "./sections/fields.tsx";
import { Menus } from "./sections/menus.tsx";
import { Popovers } from "./sections/popovers.tsx";
import { RadioGroups } from "./sections/radio-groups.tsx";
import { Selects } from "./sections/selects.tsx";
import { Switches } from "./sections/switches.tsx";
import { Tabs } from "./sections/tabs.tsx";
import { TextInputs } from "./sections/text-inputs.tsx";
import { Textareas } from "./sections/textareas.tsx";
import { Toasts } from "./sections/toasts.tsx";
import { Tooltips } from "./sections/tooltips.tsx";

const NAV = [
  { id: "button", label: "Button" },
  { id: "field", label: "Field and Input" },
  { id: "text-input", label: "Text input" },
  { id: "textarea", label: "Textarea" },
  { id: "checkbox", label: "Checkbox" },
  { id: "switch", label: "Switch" },
  { id: "radio-group", label: "Radio group" },
  { id: "select", label: "Select" },
  { id: "combobox", label: "Combobox" },
  { id: "dialog", label: "Dialog" },
  { id: "alert-dialog", label: "Alert dialog" },
  { id: "drawer", label: "Drawer" },
  { id: "popover", label: "Popover" },
  { id: "tooltip", label: "Tooltip" },
  { id: "menu", label: "Menu" },
  { id: "tabs", label: "Tabs" },
  { id: "toast", label: "Toast" },
  { id: "badge", label: "Badge" },
  { id: "card", label: "Card" },
] as const;

function ThemeToggle(): JSX.Element {
  const root = document.documentElement;
  const [isDark, setIsDark] = createSignal(root.classList.contains("dark"));

  function toggle(): void {
    const isNextDark = !isDark();
    root.classList.toggle("dark", isNextDark);
    root.classList.toggle("light", !isNextDark);

    try {
      localStorage.setItem(THEME_KEY, isNextDark ? "dark" : "light");
    } catch {}

    setIsDark(isNextDark);
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {isDark() ? "Light" : "Dark"} theme
    </Button>
  );
}

function Header(): JSX.Element {
  return (
    <header
      class={cn(
        "sticky top-0 z-10 flex items-center justify-between border-b border-border",
        "bg-background/90 px-6 py-3 backdrop-blur",
      )}
    >
      <div class="flex items-baseline gap-3">
        <h1 class="font-semibold">@workerstack/ui</h1>
        <span class="text-sm text-muted-foreground">playground</span>
      </div>
      <nav class="mx-6 hidden min-w-0 flex-1 gap-4 overflow-x-auto text-sm whitespace-nowrap md:flex">
        <For each={NAV}>
          {(item) => (
            <a class="text-muted-foreground hover:text-foreground" href={`#${item.id}`}>
              {item.label}
            </a>
          )}
        </For>
      </nav>
      <ThemeToggle />
    </header>
  );
}

/** Every section, in nav order. */
function Sections(): JSX.Element {
  return (
    <main class="space-y-12">
      <Buttons />
      <Fields />
      <TextInputs />
      <Textareas />
      <Checkboxes />
      <Switches />
      <RadioGroups />
      <Selects />
      <Comboboxes />
      <Dialogs />
      <AlertDialogs />
      <Drawers />
      <Popovers />
      <Tooltips />
      <Menus />
      <Tabs />
      <Toasts />
      <Badges />
      <Cards />
    </main>
  );
}

/** Every component, one section each, beside the event log. */
export function App(): JSX.Element {
  return (
    <LogProvider>
      <div class="min-h-screen bg-background text-foreground">
        <Header />
        <div class="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_20rem]">
          <Sections />
          <div class="lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
            <EventLog />
          </div>
        </div>
        <Toaster />
      </div>
    </LogProvider>
  );
}
