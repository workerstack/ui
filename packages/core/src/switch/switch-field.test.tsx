import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

import { testFieldModule } from "../form/__fixtures__/field-module-contract.tsx";
import { testFieldWarnings } from "../form/__fixtures__/field-warnings.ts";
import { testToggleControl } from "../form/__fixtures__/toggle-behaviors.tsx";
import { AlertsField } from "./__fixtures__/profile-fields.fixture.tsx";
import { switchField } from "./field.ts";

afterEach(cleanup);

testFieldWarnings({ field: AlertsField, title: "SwitchField" });

testFieldModule({ Control: switchField.Control, module: switchField, shown: "Yes", value: true });

testToggleControl({ field: AlertsField, label: /^Alerts/, name: "alerts", role: "switch", title: "SwitchField" });
