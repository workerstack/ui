import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { testToggleControl } from "./__fixtures__/toggle-behaviors.tsx";
import { formSwitch } from "./form-switch.tsx";

afterEach(cleanup);

testFieldModule({ Control: formSwitch.Control, module: formSwitch, shown: "Yes", value: true });

testToggleControl({ label: /^Alerts/, name: "alerts", role: "switch", title: "formSwitch" });
