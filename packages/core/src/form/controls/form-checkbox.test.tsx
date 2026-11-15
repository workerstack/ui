import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { testToggleControl } from "./__fixtures__/toggle-behaviors.tsx";
import { formCheckbox } from "./form-checkbox.tsx";

afterEach(cleanup);

testFieldModule({ Control: formCheckbox.Control, module: formCheckbox, shown: "Yes", value: true });

testToggleControl({ label: /^Terms/, name: "terms", role: "checkbox", title: "formCheckbox" });
