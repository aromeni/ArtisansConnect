import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, clearRateLimitBucketsForTest, getClientIdentifier } from "./rate-limit";

describe("rate limit helpers", () => {
  afterEach(() => clearRateLimitBucketsForTest());

  it("allows requests up to the configured limit", () => {
    assert.equal(checkRateLimit("upload:1", { limit: 2, windowMs: 60_000 }).allowed, true);
    assert.equal(checkRateLimit("upload:1", { limit: 2, windowMs: 60_000 }).allowed, true);
    assert.equal(checkRateLimit("upload:1", { limit: 2, windowMs: 60_000 }).allowed, false);
  });

  it("prefers the first forwarded IP address", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });

    assert.equal(getClientIdentifier(request), "203.0.113.10");
  });
});
