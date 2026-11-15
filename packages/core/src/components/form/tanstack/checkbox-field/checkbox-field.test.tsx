import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

import { testFieldModule } from "../form/__fixtures__/field-module-contract.tsx";
import { testFieldWarnings } from "../form/__fixtures__/field-warnings.ts";
import { testToggleControl } from "../form/__fixtures__/toggle-behaviors.tsx";
import { TermsField } from "./__fixtures__/profile-fields.fixture.tsx";
import { checkboxField } from "./index.ts";

afterEach(cleanup);

testFieldWarnings({ field: TermsField, title: "CheckboxField" });

testFieldModule({ Control: checkboxField.Control, module: checkboxField, shown: "Yes", value: true });

testToggleControl({ field: TermsField, label: /^Terms/, name: "terms", role: "checkbox", title: "CheckboxField" });
