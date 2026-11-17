import { expect, it } from "vitest";
import { createSyntheticFixtures } from "@/fixtures/synthetic";
import { exportDocumentSchema } from "@/contracts/evidence";
import { measurementSchema } from "@/contracts/measurements";

it("keeps all fixtures synthetic, privately labelled, signed out and unpublished", () => {
  const fixtures = createSyntheticFixtures();
  expect(fixtures.source).toBe("synthetic");
  expect(fixtures.warning).toContain("Not real");
  expect(fixtures.session.state).toBe("signed_out");
  expect(fixtures.incident.fields.narrative).toContain("SYNTHETIC");
  expect(measurementSchema.parse(fixtures.measurement).summary.corroboration).toBe("client_only");
  expect(fixtures.measurement.contribution.state).toBe("off");
  expect(fixtures.intelligence.statistics).toBeNull();
  const evidence = exportDocumentSchema.parse(fixtures.evidence);
  expect(evidence.incidents[0]?.id).toBe(fixtures.incident.id);
  expect(evidence.measurements).toEqual([]);
  expect(evidence.retained_summaries).toEqual([]);
  expect(evidence.assets).toEqual([]);
  expect(JSON.stringify(fixtures)).not.toMatch(/service_role|one_use_token|storage_path|phone_number/);
});
it("returns isolated copies, never a shared mutable store", () => {
  const first = createSyntheticFixtures();
  first.incident.fields.narrative = "modified";
  first.operators.pop();
  const second = createSyntheticFixtures();
  expect(second.incident.fields.narrative).toContain("SYNTHETIC");
  expect(second.operators).toHaveLength(4);
});
