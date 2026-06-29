import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "@/test/render-app";

describe("root route", () => {
    it("renders the global not-found UI inside the application providers", async () => {
        renderApp("/unsupported-route");

        expect(
            await screen.findByRole("heading", { name: "Page not found" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Choose color theme" }),
        ).toBeInTheDocument();
        expect(await screen.findByText("API connected")).toBeInTheDocument();
    });
});
