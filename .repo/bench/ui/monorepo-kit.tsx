import { Button } from "@repo/frontend-ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@repo/frontend-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/frontend-ui/dropdown-menu";
import { Checkbox } from "@repo/frontend-ui/form/checkbox";
import {
  Combobox as ComboboxPart,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@repo/frontend-ui/form/combobox";
import { Field, FieldLabel } from "@repo/frontend-ui/form/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/frontend-ui/form/select";
import { Switch } from "@repo/frontend-ui/form/switch";
import { TextInput } from "@repo/frontend-ui/form/text-input";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@repo/frontend-ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/frontend-ui/tabs";
import { Toaster, toast } from "@repo/frontend-ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/frontend-ui/tooltip";
import type { JSX } from "@solidjs/web";

import type { Kit } from "./app.tsx";
import { FRUITS, type Choice } from "./content.ts";

// Base UI's combobox takes its items as data and renders its list from them, as the monorepo's
// own playground writes it.

function Combobox(props: { children?: JSX.Element }): JSX.Element {
  return <ComboboxPart items={FRUITS}>{props.children}</ComboboxPart>;
}

function FruitList(): JSX.Element {
  return <ComboboxList>{(fruit: Choice) => <ComboboxItem value={fruit}>{fruit.label}</ComboboxItem>}</ComboboxList>;
}

/** The monorepo's UI (`@repo/frontend-ui` on `@solidports/base-ui`), from its source. */
export const monorepoKit: Kit = {
  Button,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxInput,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  FruitList,
  Menu: DropdownMenu,
  MenuContent: DropdownMenuContent,
  MenuItem: DropdownMenuItem,
  MenuTrigger: DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsList,
  TabsPanel: TabsContent,
  TabsTab: TabsTrigger,
  TextInput,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  showToast: (title) => toast.add({ title }),
};
