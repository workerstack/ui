import { UiProvider } from "../index.ts";
import { ProviderProbe } from "./provider.fixture.tsx";

export const ProviderFixture = () => (
  <UiProvider locale="hr-HR" messages={{ close: "Zatvori" }}>
    <ProviderProbe />
  </UiProvider>
);
