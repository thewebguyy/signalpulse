import { describe, expect, it } from "vitest";
import { dateSchema, instantSchema, positiveMsSchema, textSchema, uintSchema } from "@/contracts/scalars";
import { operatorSchema, incidentCategorySchema, provenanceSchema } from "@/contracts/domain";
import { incidentCreateSchema, incidentCreateBoundary, incidentSchema } from "@/contracts/incidents";
import { exportCreateSchema } from "@/contracts/evidence";
import { contributionChangeSchema, contributionSchema, measurementSummarySchema } from "@/contracts/measurements";
import { publicCohortSchema, publicCohortQuerySchema } from "@/contracts/intelligence";
import { guestCreateSchema, sessionSchema } from "@/contracts/session";
import { createSyntheticFixtures, SYNTHETIC_NOW } from "@/fixtures/synthetic";

describe("canonical scalar and vocabulary boundaries", () => {
  it.each(["2026-02-29", "2026-13-01", "2026-11-31"])("rejects impossible date %s", (value) => expect(dateSchema.safeParse(value).success).toBe(false));
  it("accepts leap day and canonical UTC, rejects ambiguous timestamps", () => {
    expect(dateSchema.parse("2028-02-29")).toBe("2028-02-29");
    expect(instantSchema.parse(SYNTHETIC_NOW)).toBe(SYNTHETIC_NOW);
    for (const value of ["2026-11-16T09:00:00Z", "2026-11-16T10:00:00.000+01:00", "2026-02-30T00:00:00.000Z"]) expect(instantSchema.safeParse(value).success).toBe(false);
  });
  it("normalizes line endings and counts Unicode code points", () => {
    expect(textSchema(1, 3).parse("😀\r\nx")).toBe("😀\nx");
    expect(textSchema(1, 1).safeParse("😀x").success).toBe(false);
    expect(textSchema().safeParse("secret\u0000").success).toBe(false);
    expect(textSchema().parse("a\tb")).toBe("a\tb");
  });
  it.each([0, -1, Infinity, NaN, 30_000.001, 1.1234])("rejects invalid duration %s", (value) => expect(positiveMsSchema.safeParse(value).success).toBe(false));
  it("retains millisecond precision and safe integers", () => {
    expect(positiveMsSchema.parse(1.123)).toBe(1.123);
    expect(uintSchema.safeParse(Number.MAX_SAFE_INTEGER + 1).success).toBe(false);
  });
  it("keeps categories and provenance distinct", () => {
    expect(operatorSchema.options).toEqual(["mtn", "airtel", "glo", "t2mobile"]);
    expect(incidentCategorySchema.options).toHaveLength(6);
    expect(provenanceSchema.options).toEqual(["app_measured", "device_observed", "user_reported", "user_attached", "official_source"]);
    expect(incidentCategorySchema.safeParse("data_theft_detected").success).toBe(false);
  });
});

describe("incident request and response compatibility", () => {
  it("rejects supplied ownership and unknown nested request fields", () => {
    const { incidentCreate: request } = createSyntheticFixtures();
    expect(incidentCreateSchema.safeParse({ ...request, owner_id: "someone" }).success).toBe(false);
    expect(incidentCreateSchema.safeParse({ ...request, fields: { ...request.fields, coordinates: [1, 2] } }).success).toBe(false);
    expect(incidentCreateSchema.safeParse({ ...request, fields: { ...request.fields, area_id: undefined } }).success).toBe(false);
  });
  it("ignores additive response fields but never promotes provenance", () => {
    const { incident } = createSyntheticFixtures();
    expect(incidentSchema.parse({ ...incident, newer: true, fields: { ...incident.fields, newer: true } })).toEqual(incident);
    expect(incidentSchema.safeParse({ ...incident, provenance: "official_source" }).success).toBe(false);
    expect(incidentSchema.safeParse({ ...incident, expires_at: incident.created_at }).success).toBe(false);
  });
  it("uses the supplied clock/catalog, including exact retry bounds", () => {
    const request = createSyntheticFixtures().incidentCreate;
    const now = new Date(SYNTHETIC_NOW);
    const boundary = incidentCreateBoundary({ now, areaIds: new Set(["synthetic-lga"]) });
    for (const delta of [-30 * 86400_000, 300_000]) expect(boundary.safeParse({ ...request, client_created_at: new Date(+now + delta).toISOString() }).success).toBe(true);
    for (const delta of [-30 * 86400_000 - 1, 300_001]) expect(boundary.safeParse({ ...request, client_created_at: new Date(+now + delta).toISOString() }).success).toBe(false);
    expect(boundary.safeParse({ ...request, fields: { ...request.fields, area_id: "unknown" } }).success).toBe(false);
    expect(boundary.safeParse({ ...request, fields: { ...request.fields, occurred_at: new Date(+now + 300_001).toISOString() } }).success).toBe(false);
    expect(boundary.safeParse({ ...request, fields: { ...request.fields, occurred_at: "2020-01-01T00:00:00.000Z" } }).success).toBe(true);
  });
});

describe("consent, measurements, sessions and export boundaries", () => {
  it("requires explicit guest acknowledgement and coherent session identity", () => {
    expect(guestCreateSchema.safeParse({ accept_guest_limitations: false }).success).toBe(false);
    const session = createSyntheticFixtures().session;
    expect(sessionSchema.safeParse({ ...session, state: "active_guest" }).success).toBe(false);
    expect(sessionSchema.safeParse({ ...session, owner_id: createSyntheticFixtures().incident.id }).success).toBe(false);
  });
  it("permits withdrawal without new consent, requires current notice for grant", () => {
    expect(contributionChangeSchema.safeParse({ expected_revision: 1, contribute: false, notice_version: null }).success).toBe(true);
    expect(contributionChangeSchema.safeParse({ expected_revision: 1, contribute: true, notice_version: null }).success).toBe(false);
    expect(contributionChangeSchema.safeParse({ expected_revision: 1, contribute: true, notice_version: "contribution-0.1" }).success).toBe(true);
    const contribution = createSyntheticFixtures().measurement.contribution;
    expect(contributionSchema.safeParse({ ...contribution, publication_effect: "candidate_only" }).success).toBe(false);
  });
  it("rejects unavailable-as-zero and swapped units", () => {
    const summary = createSyntheticFixtures().measurement.summary;
    for (const download of [{ state: "failed", value: 0, unit: "Mbps" }, { state: "completed", value: null, unit: "Mbps" }, { state: "completed", value: 0, unit: "Mbps" }, { state: "completed", value: 10, unit: "ms" }]) expect(measurementSummarySchema.safeParse({ ...summary, download }).success).toBe(false);
  });
  it("requires a Monday cohort and null statistics when unavailable", () => {
    const cohort = createSyntheticFixtures().intelligence;
    expect(publicCohortSchema.safeParse({ ...cohort, status: "published" }).success).toBe(false);
    expect(publicCohortQuerySchema.safeParse({ area_id: cohort.area_id, operator: cohort.operator, week_start: "2026-11-10", method_version: cohort.method_version, endpoint_id: cohort.endpoint_id, metric: cohort.metric }).success).toBe(false);
  });
  it("rejects empty/duplicate/oversized export selections", () => {
    const id = createSyntheticFixtures().incident.id;
    const base = { format: "json", incident_ids: [id], measurement_ids: [], include_linked_summaries: false };
    expect(exportCreateSchema.safeParse(base).success).toBe(true);
    expect(exportCreateSchema.safeParse({ ...base, incident_ids: [] }).success).toBe(false);
    expect(exportCreateSchema.safeParse({ ...base, measurement_ids: [id] }).success).toBe(false);
    expect(exportCreateSchema.safeParse({ ...base, incident_ids: Array(21).fill(id) }).success).toBe(false);
  });
});
