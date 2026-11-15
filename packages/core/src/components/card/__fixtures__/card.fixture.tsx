import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../index.ts";

/** A full card with an action in its header. */
export function FullCard() {
  return (
    <Card data-testid="card">
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>Billed monthly</CardDescription>
        <CardAction>Edit</CardAction>
      </CardHeader>
      <CardContent>Body</CardContent>
      <CardFooter>Foot</CardFooter>
    </Card>
  );
}
