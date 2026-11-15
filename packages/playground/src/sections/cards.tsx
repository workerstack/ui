import type { JSX } from "@solidjs/web";
import { Badge } from "@workerstack/ui/components/badge";
import { Button } from "@workerstack/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workerstack/ui/components/card";

import { Example, Section } from "../section.tsx";

/** A bordered box with a header, content and footer. */
export function Cards(): JSX.Element {
  return (
    <Section id="card" title="Card" description="A bordered box with a header, content and footer.">
      <Example align="start" label="Every part">
        <Card class="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Team plan</CardTitle>
            <CardDescription>Billed every month.</CardDescription>
            <CardAction>
              <Badge variant="secondary">Current</Badge>
            </CardAction>
          </CardHeader>
          <CardContent class="text-sm">Ten seats, shared projects and audit logs.</CardContent>
          <CardFooter class="gap-2">
            <Button size="sm">Upgrade</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Example>
    </Section>
  );
}
