import { Input } from "../components/input/index.ts";

/** A required label mark and an optional one, drawn by the theme from `data-mark-text`. */
export function MarkFixture() {
  return (
    <div>
      <span data-mark="required" data-mark-text="*" data-testid="required-label">
        Name
      </span>
      <span data-mark="optional" data-mark-text="(optional)" data-testid="optional-label">
        Nickname
      </span>
    </div>
  );
}

/** A read-only input, the kind that rings only when the keyboard brought focus. */
export function ReadOnlyFixture() {
  return <Input aria-label="Code" defaultValue="A-1" readonly />;
}
