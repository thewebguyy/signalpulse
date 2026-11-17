/** Domain predicate only, not authentication, session validation or an RLS replacement. */
export function sameActiveOwner(input: {
  actorOwnerId: string | null;
  recordOwnerId: string;
  ownerState: "active" | "deleting" | "deleted";
}): boolean {
  return input.ownerState === "active" && input.actorOwnerId !== null && input.actorOwnerId.length > 0 && input.actorOwnerId === input.recordOwnerId;
}
