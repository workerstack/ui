import { testFieldHydration } from "../form/__fixtures__/field-hydration.ts";
import { PROFILE_ERRORS } from "../form/__fixtures__/profile.fixture.ts";
import { Blank, Editable, ReadOnly } from "./__fixtures__/text-input-field.hydration.fixture.tsx";

testFieldHydration({
  error: PROFILE_ERRORS.name,
  fixture: new URL("./__fixtures__/text-input-field.hydration.fixture.tsx", import.meta.url),
  fixtures: { Blank, Editable, ReadOnly },
  title: "TextInputField",
});
