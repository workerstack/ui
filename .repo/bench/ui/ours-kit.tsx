import type { JSX } from "@solidjs/web";
import { Button } from "@workerstack/ui/button";
import { Checkbox } from "@workerstack/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@workerstack/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@workerstack/ui/dialog";
import { Field, FieldLabel } from "@workerstack/ui/field";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@workerstack/ui/menu";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@workerstack/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workerstack/ui/select";
import { Switch } from "@workerstack/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@workerstack/ui/tabs";
import { TextInput } from "@workerstack/ui/text-input";
import { Toaster, toast } from "@workerstack/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workerstack/ui/tooltip";

import { ChildFruitList, type Kit } from "./app.tsx";

function FruitList(): JSX.Element {
  return <ChildFruitList item={ComboboxItem} list={ComboboxList} />;
}

/** @workerstack/ui's parts, used as its docs show them. */
export const oursKit: Kit = {
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
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
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
  TabsPanel,
  TabsTab,
  TextInput,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  showToast: (title) => toast({ title }),
};
