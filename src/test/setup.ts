import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "@/test/mocks/server";

class MemoryStorage implements Storage {
    readonly #values = new Map<string, string>();

    public get length(): number {
        return this.#values.size;
    }

    public clear(): void {
        this.#values.clear();
    }

    public getItem(key: string): string | null {
        return this.#values.get(key) ?? null;
    }

    public key(index: number): string | null {
        return Array.from(this.#values.keys())[index] ?? null;
    }

    public removeItem(key: string): void {
        this.#values.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.#values.set(key, value);
    }
}

const localStorage = new MemoryStorage();

Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorage,
});

Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorage,
});

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
    vi.useRealTimers();
});

afterAll(() => {
    server.close();
});

Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
});

window.requestAnimationFrame = (callback) => {
    callback(0);
    return 0;
};

window.scrollTo = vi.fn();
