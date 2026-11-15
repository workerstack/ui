import { testFieldHydration } from "../form/__fixtures__/field-hydration.ts";
import { PROFILE_ERRORS } from "../form/__fixtures__/profile.fixture.ts";
import { Blank, Editable, ReadOnly } from "./__fixtures__/select-field.hydration.fixture.tsx";

// Its content part warns on the server (docs/upstream/ui-sdk.md, UISDK-1); the rest must match.
testFieldHydration({
  error: PROFILE_ERRORS.role,
  fixture: new URL("./__fixtures__/select-field.hydration.fixture.tsx", import.meta.url),
  fixtures: { Blank, Editable, ReadOnly },
  kinds: ["warnings", "replaced", "added"],
  title: "SelectField",
});
