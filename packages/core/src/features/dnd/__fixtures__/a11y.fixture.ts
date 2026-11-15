// A rule check of the ARIA the dnd engine and the harness pages write, standing in for the monorepo's axe run: axe
// is not a dependency of this package. Each rule mirrors an axe rule the pages could break.

const FOCUSABLE = "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
const ROLES_WITH_EXPANDED = new Set(["button", "treeitem", "combobox", "link", "row", "tab"]);

/** The element's role: its explicit one, or the implicit role of the tags the pages use. */
function roleOf(el: Element): string {
  const role = el.getAttribute("role");
  if (role !== null) return role;
  const tag = el.tagName.toLowerCase();
  if (tag === "a" && el.hasAttribute("href")) return "link";
  return tag === "button" ? "button" : tag;
}

/** The element's accessible name, as far as the pages need: aria-label, aria-labelledby, or its text. */
function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label !== null) return label.trim();
  const ids = el.getAttribute("aria-labelledby");
  if (ids !== null) return ids.split(" ").map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
  return el.textContent.trim();
}

/** ID references that point nowhere (axe aria-valid-attr-value). */
function brokenReferences(root: ParentNode): string[] {
  return [...root.querySelectorAll("[aria-describedby], [aria-labelledby], [aria-controls]")].flatMap((el) =>
    ["aria-describedby", "aria-labelledby", "aria-controls"].flatMap((attr) =>
      (el.getAttribute(attr) ?? "")
        .split(" ")
        .filter((id) => id !== "" && document.getElementById(id) === null)
        .map((id) => `${attr}="${id}" points nowhere`),
    ),
  );
}

/** Focusable controls without a name (axe button-name, link-name), or hidden from assistive tech (axe aria-hidden-focus). */
function badFocusables(root: ParentNode): string[] {
  return [...root.querySelectorAll(FOCUSABLE)].flatMap((el) => {
    const problems: string[] = [];
    if (nameOf(el) === "") problems.push(`${el.outerHTML.slice(0, 60)} has no name`);
    if (el.closest("[aria-hidden='true']") !== null) problems.push(`${el.outerHTML.slice(0, 60)} is focusable but hidden`);
    return problems;
  });
}

/** Tree items outside a tree or group, and aria-expanded on roles that don't take it (axe aria-required-parent, aria-allowed-attr). */
function badRoles(root: ParentNode): string[] {
  const orphans = [...root.querySelectorAll("[role='treeitem']")]
    .filter((el) => el.parentElement?.closest("[role='tree'], [role='group']") === null)
    .map((el) => `treeitem ${nameOf(el)} sits outside a tree`);
  const expanded = [...root.querySelectorAll("[aria-expanded]")]
    .filter((el) => !ROLES_WITH_EXPANDED.has(roleOf(el)))
    .map((el) => `aria-expanded on a ${roleOf(el)}`);
  return [...orphans, ...expanded];
}

/** Live regions without a status role and polite, atomic speech, and duplicated ids (axe duplicate-id-aria). */
function badRegionsAndIds(root: ParentNode): string[] {
  const regions = [...root.querySelectorAll("[data-dnd-live]")]
    .filter((el) => el.getAttribute("role") !== "status" || el.getAttribute("aria-live") !== "polite" || el.getAttribute("aria-atomic") !== "true")
    .map(() => "a live region lacks role=status, aria-live=polite or aria-atomic=true");
  const ids = [...root.querySelectorAll("[id]")].map((el) => el.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `id ${id} is not unique`);
  return [...regions, ...duplicates];
}

/** Every ARIA problem on the page; empty when it is clean. */
export function a11yProblems(root: ParentNode = document): string[] {
  return [...brokenReferences(root), ...badFocusables(root), ...badRoles(root), ...badRegionsAndIds(root)];
}
