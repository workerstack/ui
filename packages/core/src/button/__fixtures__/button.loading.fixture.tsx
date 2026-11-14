import { UiProvider } from "../../provider/index.ts";
import { Button } from "../index.ts";

/** A loading button under a provider whose `loading` string is Croatian. */
export function TranslatedLoadingButtonFixture() {
  return (
    <UiProvider messages={{ loading: "Učitavanje" }}>
      <Button loading>Save</Button>
    </UiProvider>
  );
}
