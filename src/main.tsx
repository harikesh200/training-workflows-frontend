import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { queryClient } from "@/app/query-client";
import { router } from "@/app/router";
import "@/index.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
    throw new Error("Application root element was not found");
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
);
