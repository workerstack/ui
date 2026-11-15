import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { mounted } from "../../test/dom.ts";
import { required } from "../../test/required.ts";
import { formatLocale, regionOfTimeZone } from "../../utils/locale/index.ts";
import { FORM_DIALOG_MESSAGES_EN, type FormDialogMessages } from "../form/tanstack/dialog/dialog.messages.ts";
import {
  LEAVE_CONFIRM_MESSAGES_EN,
  type LeaveConfirmMessages,
} from "../form/tanstack/unsaved/leave-confirm.messages.ts";
import { ComboboxMessagesProbe, ProviderProbe, ValidityMessagesProbe } from "./__fixtures__/provider.fixture.tsx";
import { type UiMessages, UiProvider, useUiMessages } from "./index.ts";

afterEach(cleanup);

it("UiProvider merges message overrides over English defaults", () => {
  render(() => (
    <UiProvider messages={{ close: "Zatvori" }}>
      <ProviderProbe />
    </UiProvider>
  ));
  expect(screen.getByTestId("close").textContent).toBe("Zatvori");
  expect(screen.getByTestId("clear").textContent).toBe("Clear");
});

it("UiProvider falls back to English for combobox strings and translates them", () => {
  const [messages, setMessages] = createSignal<Partial<UiMessages>>({});
  render(() => (
    <UiProvider messages={messages()}>
      <ComboboxMessagesProbe />
    </UiProvider>
  ));
  expect(screen.getByTestId("no-results").textContent).toBe("No results");
  expect(screen.getByTestId("create").textContent).toBe("Create “Design”");
  setMessages({ comboboxCreate: (label) => `Stvori „${label}”`, noResults: "Nema rezultata" });
  flush();
  expect(screen.getByTestId("no-results").textContent).toBe("Nema rezultata");
  expect(screen.getByTestId("create").textContent).toBe("Stvori „Design”");
});

it("UiProvider follows message changes (a language switch) without remounting", () => {
  const [messages, setMessages] = createSignal<Partial<UiMessages>>({ close: "Zatvori" });
  render(() => (
    <UiProvider messages={messages()}>
      <ProviderProbe />
    </UiProvider>
  ));
  const probe = screen.getByTestId("close");
  setMessages({ close: "Schließen" });
  flush();
  expect(screen.getByTestId("close")).toBe(probe);
  expect(probe.textContent).toBe("Schließen");
  setMessages({});
  flush();
  expect(probe.textContent).toBe("Close");
});

it("UiProvider gives en-US and English without a provider", () => {
  render(() => <ProviderProbe />);
  expect(screen.getByTestId("locale").textContent).toBe("en-US");
  expect(screen.getByTestId("close").textContent).toBe("Close");
});

it("UiProvider gives en-US when it has no locale", () => {
  render(() => (
    <UiProvider>
      <ProviderProbe />
    </UiProvider>
  ));
  expect(screen.getByTestId("locale").textContent).toBe("en-US");
});

it("UiProvider useUiLocale returns a given tag", () => {
  render(() => (
    <UiProvider locale="hr-HR">
      <ProviderProbe />
    </UiProvider>
  ));
  expect(screen.getByTestId("locale").textContent).toBe("hr-HR");
});

it("UiProvider follows a locale change without remounting", () => {
  const [locale, setLocale] = createSignal("hr-HR");
  render(() => (
    <UiProvider locale={locale()}>
      <ProviderProbe />
    </UiProvider>
  ));
  setLocale("de-DE");
  flush();
  expect(screen.getByTestId("locale").textContent).toBe("de-DE");
});

it("UiProvider uses a resolution with a preference as is", async () => {
  render(() => (
    <UiProvider locale={{ locale: "fr-CA", preference: "fr-CA", region: "CA" }}>
      <ProviderProbe />
    </UiProvider>
  ));
  await mounted();
  flush();
  expect(screen.getByTestId("locale").textContent).toBe("fr-CA");
});

it("UiProvider uses a resolution with a fixed region as is", async () => {
  render(() => (
    <UiProvider locale={{ locale: "fr-CA", region: "CA", regionFixed: true }}>
      <ProviderProbe />
    </UiProvider>
  ));
  await mounted();
  flush();
  expect(screen.getByTestId("locale").textContent).toBe("fr-CA");
});

it("UiProvider refines a resolution without a preference to the browser time zone's region after mount", async () => {
  const region = required(
    regionOfTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    "a region for the browser's time zone",
  );

  const resolution = { language: "en", locale: "en", region: undefined };
  render(() => (
    <UiProvider locale={resolution}>
      <ProviderProbe />
    </UiProvider>
  ));
  await mounted();
  flush();
  expect(screen.getByTestId("locale").textContent).toBe(formatLocale({ language: "en", region }));
});

it("UiProvider relabels a plain and a function validity string, and falls back to English", () => {
  const [messages, setMessages] = createSignal<Partial<UiMessages>>({});
  render(() => (
    <UiProvider messages={messages()}>
      <ValidityMessagesProbe />
    </UiProvider>
  ));
  expect(screen.getByTestId("required-field").textContent).toBe("This is required.");
  expect(screen.getByTestId("too-long").textContent).toBe("12 of 10 characters: shorten it.");
  setMessages({ requiredField: "Obavezno.", textTooLong: (length, max) => `${length}/${max}: skrati.` });
  flush();
  expect(screen.getByTestId("required-field").textContent).toBe("Obavezno.");
  expect(screen.getByTestId("too-long").textContent).toBe("12/10: skrati.");
});

it("UiProvider flips html data-focus-source on a key press and a pointer press, and clears it on dispose", async () => {
  const view = render(() => (
    <UiProvider>
      <ProviderProbe />
    </UiProvider>
  ));

  await mounted();
  flush();
  fireEvent.keyDown(document.body, { key: "Tab" });
  expect(document.documentElement.dataset["focusSource"]).toBe("keyboard");
  fireEvent.pointerDown(document.body);
  expect(document.documentElement.dataset["focusSource"]).toBe("pointer");
  fireEvent.keyDown(document.body, { key: "a" });
  expect(document.documentElement.dataset["focusSource"]).toBe("keyboard");
  view.unmount();
  flush();
  expect(document.documentElement.dataset["focusSource"]).toBeUndefined();
  fireEvent.pointerDown(document.body);
  expect(document.documentElement.dataset["focusSource"]).toBeUndefined();
});

it("UiProvider gives the form strings, translated or English, and is never mistaken for a promise", async () => {
  let dialog: FormDialogMessages | undefined;
  let leave: LeaveConfirmMessages | undefined;
  render(() => (
    <UiProvider messages={{ formSave: "Spremi" }}>
      {(() => {
        dialog = useUiMessages(FORM_DIALOG_MESSAGES_EN);
        leave = useUiMessages(LEAVE_CONFIRM_MESSAGES_EN);

        return null;
      })()}
    </UiProvider>
  ));
  const strings = required(dialog, "the dialog's strings");
  expect(strings.formSave).toBe("Spremi");
  expect(strings.formCancel).toBe("Cancel");
  expect(required(leave, "the leave confirm's strings").unsavedLeaveDescription(["Profile", "Billing"])).toBe(
    "Your changes to Profile and Billing will be lost.",
  );
  expect(await Promise.resolve(strings)).toBe(strings);
});
