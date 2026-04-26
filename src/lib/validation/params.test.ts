import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GhanaRegion, JobStatus } from "@prisma/client";
import { parseGhanaRegion, parseJobStatus } from "./params";

describe("URL enum param parsing", () => {
  it("returns typed enum values for valid params", () => {
    assert.equal(parseGhanaRegion("GREATER_ACCRA"), GhanaRegion.GREATER_ACCRA);
    assert.equal(parseJobStatus("OPEN"), JobStatus.OPEN);
  });

  it("rejects invalid params", () => {
    assert.equal(parseGhanaRegion("Greater Accra"), undefined);
    assert.equal(parseJobStatus("archived"), undefined);
  });
});
