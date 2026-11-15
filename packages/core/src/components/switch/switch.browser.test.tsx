import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { NO_RING, part, rect, settled, style, token } from "../../test/browser.ts";
import { NotifySwitch, type NotifySwitchProps } from "./__fixtures__/notify-switch.fixture.tsx";

afterEach(cleanup);

/** The focus ring: a 3px spread shadow, on top of the track's resting shadow. */
const RING = /0px 0px 0px 3px/;

/** Slack for subpixel layout and the track's 1px border. */
const EDGE = 1.5;

function control(): ReturnType<typeof page.getByRole> {
  return page.getByRole("switch", { name: "Notifications" });
}

it("Switch is 1.15rem by 2rem, round, with the input color while off", async () => {
  render(() => <NotifySwitch />);
  await expect.element(control()).toBeVisible();
  const track = control().element();
  const rem = Number.parseFloat(style(document.documentElement).fontSize);
  const box = rect(track);
  expect(box.height).toBeCloseTo(rem * 1.15, 0);
  expect(box.width).toBeCloseTo(rem * 2, 0);
  expect(style(track).backgroundColor).toBe(token("--ui-input"));
  expect(Number.parseFloat(style(track).borderTopLeftRadius)).toBeGreaterThanOrEqual(box.height / 2);
});

it("Switch moves its thumb to the end edge with a real click and turns primary", async () => {
  const onCheckedChange = vi.fn<NonNullable<NotifySwitchProps["onCheckedChange"]>>();
  render(() => <NotifySwitch onCheckedChange={onCheckedChange} />);
  const track = control().element();
  const thumb = part(track, "switch-thumb");
  expect(rect(thumb).left - rect(track).left).toBeLessThanOrEqual(EDGE);
  await userEvent.click(control());
  await expect.element(control()).toHaveAttribute("aria-checked", "true");
  expect(onCheckedChange.mock.calls.at(-1)?.[0]).toBe(true);
  await settled(track);
  expect(rect(track).right - rect(thumb).right).toBeLessThanOrEqual(EDGE);
  expect(rect(thumb).left - rect(track).left).toBeGreaterThan(rect(track).width / 3);
  expect(style(track).backgroundColor).toBe(token("--ui-primary"));
  expect(style(thumb).backgroundColor).toBe(token("--ui-background"));
  expect(rect(thumb).width).toBeCloseTo(Number.parseFloat(style(document.documentElement).fontSize), 0);
});

it("Switch moves its thumb back to the start when turned off again", async () => {
  render(() => <NotifySwitch defaultChecked />);
  const track = control().element();
  const thumb = part(track, "switch-thumb");
  await settled(track);
  expect(rect(track).right - rect(thumb).right).toBeLessThanOrEqual(EDGE);
  await userEvent.click(control());
  await expect.element(control()).toHaveAttribute("aria-checked", "false");
  await settled(track);
  expect(rect(thumb).left - rect(track).left).toBeLessThanOrEqual(EDGE);
  expect(style(track).backgroundColor).toBe(token("--ui-input"));
});

it("Switch draws a focus ring on keyboard focus only", async () => {
  render(() => <NotifySwitch />);
  const track = control().element();
  await userEvent.click(control());
  await settled(track);
  await userEvent.click(document.body, { position: { x: 900, y: 700 } });
  await settled(track);
  expect(style(track).boxShadow).not.toMatch(RING);
  await userEvent.tab();
  expect(document.activeElement).toBe(track);
  await settled(track);
  expect(style(track).boxShadow).toMatch(RING);
  expect(style(track).borderTopColor).toBe(token("--ui-ring"));
});

it("Switch toggles with Space from the keyboard", async () => {
  render(() => <NotifySwitch />);
  await userEvent.tab();
  await userEvent.keyboard(" ");
  await expect.element(control()).toHaveAttribute("aria-checked", "true");
});

it("Switch dims while disabled and does not toggle on click", async () => {
  const onCheckedChange = vi.fn<NonNullable<NotifySwitchProps["onCheckedChange"]>>();
  render(() => <NotifySwitch disabled onCheckedChange={onCheckedChange} />);
  const track = control().element();
  expect(style(track).opacity).toBe("0.5");
  expect(style(track).cursor).toBe("not-allowed");
  await userEvent.click(control(), { force: true });
  expect(onCheckedChange).not.toHaveBeenCalled();
});

it("Switch sm is 0.875rem by 1.5rem with a 0.75rem thumb at each end", async () => {
  render(() => <NotifySwitch size="sm" defaultChecked />);
  await expect.element(control()).toBeVisible();
  const track = control().element();
  const thumb = part(track, "switch-thumb");
  const rem = Number.parseFloat(style(document.documentElement).fontSize);
  await settled(track);
  expect(rect(track).height).toBeCloseTo(rem * 0.875, 0);
  expect(rect(track).width).toBeCloseTo(rem * 1.5, 0);
  expect(rect(thumb).width).toBeCloseTo(rem * 0.75, 0);
  expect(rect(track).right - rect(thumb).right).toBeLessThanOrEqual(EDGE);
  await userEvent.click(control());
  await settled(track);
  expect(rect(thumb).left - rect(track).left).toBeLessThanOrEqual(EDGE);
});

it("Switch read-only keeps its look with a default cursor and no resting shadow, and does not toggle", async () => {
  const onCheckedChange = vi.fn<NonNullable<NotifySwitchProps["onCheckedChange"]>>();
  render(() => <NotifySwitch readOnly defaultChecked onCheckedChange={onCheckedChange} />);
  const track = control().element();
  expect(style(track).cursor).toBe("default");
  expect(style(track).boxShadow).toMatch(NO_RING);
  expect(style(track).backgroundColor).toBe(token("--ui-primary"));
  await userEvent.click(control());
  expect(onCheckedChange).not.toHaveBeenCalled();
});
