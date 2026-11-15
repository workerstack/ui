import { Tabs, TabsList, TabsPanel, TabsTab, type TabsListProps, type TabsProps } from "../index.ts"

/** The tabs the fixture shows, with the third one disabled. */
export const SECTIONS = [
  { value: "overview", label: "Overview", disabled: false },
  { value: "billing", label: "Billing", disabled: false },
  { value: "archive", label: "Archive", disabled: true },
  { value: "settings", label: "Settings", disabled: false },
]

export type ProjectTabsProps = {
  defaultValue?: string
  orientation?: TabsProps["orientation"]
  activation?: TabsProps["activation"]
  dir?: TabsProps["dir"]
  variant?: TabsListProps["variant"]
  onValueChange?: TabsProps["onValueChange"]
}

/** A Tabs with four tabs, one panel each, and a button after it to check the tab stop. */
export function ProjectTabs(props: ProjectTabsProps) {
  return (
    <div>
      <Tabs
        defaultValue={props.defaultValue}
        orientation={props.orientation}
        activation={props.activation}
        dir={props.dir}
        onValueChange={props.onValueChange}
      >
        <TabsList aria-label="Project" variant={props.variant}>
          {SECTIONS.map((section) => (
            <TabsTab value={section.value} disabled={section.disabled}>
              {section.label}
            </TabsTab>
          ))}
        </TabsList>
        {SECTIONS.map((section) => (
          <TabsPanel value={section.value}>{section.label} content</TabsPanel>
        ))}
      </Tabs>
      <button type="button">After</button>
    </div>
  )
}
