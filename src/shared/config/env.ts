import { z } from "zod";

const frontendEnvSchema = z.object({ 
    VITE_API_BASE_URL: z
        .url("VITE_API_BASE_URL must be a valid URL")
        .default("http://localhost:3000")
        .transform((value) => value.replace(/\/+$/, "")),
});

const parsedEnv = frontendEnvSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});

if (!parsedEnv.success) {
    throw new Error("Invalid frontend environment configuration");
}

export const config = Object.freeze({
    apiBaseUrl: parsedEnv.data.VITE_API_BASE_URL,
});
