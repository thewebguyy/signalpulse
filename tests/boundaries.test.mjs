import { expect, it } from "vitest";
import { checkSourceGraph, scanRepository } from "../scripts/check-boundaries.mjs";
it("validates the real repository", () => expect(scanRepository()).toEqual([]));
it("rejects transitive client access through re-exports", () => {
  const graph = { "app/client.tsx": '"use client"; import "../shared";', "shared.ts": 'export * from "./server/private";', "server/private.ts": "export const secret = 1;" };
  expect(checkSourceGraph(graph).join()).toContain("client reaches private");
});
it("rejects relative domain leaks and dynamic module loading", () => {
  expect(checkSourceGraph({ "contracts/bad.ts": 'import "../server/private";', "server/private.ts": "" }).join()).toContain("contracts must remain independent");
  expect(checkSourceGraph({ "app/bad.ts": "import(someUserInput);" }).join()).toContain("nonliteral");
});
it("rejects process access outside the guarded environment module", () => {
  expect(checkSourceGraph({ "app/bad.ts": 'const key = process["env"];' }).join()).toContain("process access");
});
it("allows client consumption of pure shared contracts", () => {
  expect(checkSourceGraph({ "app/client.tsx": '"use client"; import "@/contracts/good";', "contracts/good.ts": 'import { z } from "zod";' })).toEqual([]);
});
