import { Switch } from "../index.ts";

/** A required switch in a form, off unless `defaultChecked`. */
export function RequiredSwitch(props: { defaultChecked?: boolean }) {
  return (
    <form>
      <Switch required defaultChecked={props.defaultChecked} aria-label="Terms" />
    </form>
  );
}
