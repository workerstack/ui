import { createSignal } from "solid-js"
import { Tabs, TabsList, TabsPanel, TabsTab } from "../index.ts"

/** A Tabs whose selected value is shown in an output. */
export function TabsFixture() {
  const [value, setValue] = createSignal<string | null>("overview")
  return (
    <div>
      <Tabs defaultValue="overview" onValueChange={setValue}>
        <TabsList aria-label="Project">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="billing">Billing</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview content</TabsPanel>
        <TabsPanel value="billing">Billing content</TabsPanel>
      </Tabs>
      <output>{value()}</output>
    </div>
  )
}

/** The line variant. */
export function TabsLineFixture() {
  return (
    <Tabs defaultValue="billing">
      <TabsList aria-label="Project" variant="line">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="billing">Billing</TabsTab>
      </TabsList>
      <TabsPanel value="overview">Overview content</TabsPanel>
      <TabsPanel value="billing">Billing content</TabsPanel>
    </Tabs>
  )
}
