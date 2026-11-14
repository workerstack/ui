import { expect, it } from "vitest";

import { renderServer, text } from "../test/server.ts";
import { ProviderProbe } from "./__fixtures__/provider.fixture.tsx";
import { UiProvider } from "./index.ts";

it("UiProvider on the server renders translated messages and the given locale", () => {
  const { html, warnings } = renderServer(() => (
    <UiProvider locale="hr-HR" messages={{ close: "Zatvori" }}>
      <ProviderProbe />
    </UiProvider>
  ));

  expect(text(html)).toBe("ClearZatvorihr-HR");
  expect(warnings).toStrictEqual([]);
});

it("UiProvider on the server renders English and en-US without a provider", () => {
  expect(text(renderServer(() => <ProviderProbe />).html)).toBe("ClearCloseen-US");
});

it("UiProvider on the server uses a resolution's locale as given", () => {
  const { html, warnings } = renderServer(() => (
    <UiProvider locale={{ locale: "de-AT", region: "AT" }}>
      <ProviderProbe />
    </UiProvider>
  ));

  expect(text(html)).toBe("ClearClosede-AT");
  expect(warnings).toStrictEqual([]);
});
