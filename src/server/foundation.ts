import "server-only";
import { getServerEnvironment } from "@/config/server";
import { createSyntheticFixtures } from "@/fixtures/synthetic";

/** Composition root. No environment switch can enable a live adapter. */
export function readFoundationPreview() {
  getServerEnvironment();
  return createSyntheticFixtures();
}
