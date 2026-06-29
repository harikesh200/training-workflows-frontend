import { describe, expect, it } from "vitest";

import { buildArtifactUrl } from "@/features/workflows/api/workflows.api";

describe("buildArtifactUrl", () => {
    it("safely encodes workflow IDs and artifact names", () => {
        expect(buildArtifactUrl("wf/one two", "invoice/Acme & Sons")).toBe(
            "http://localhost:3000/v1/workflows/wf%2Fone%20two/artifacts/invoice%2FAcme%20%26%20Sons",
        );
    });
});
