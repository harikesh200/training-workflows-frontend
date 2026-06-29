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
        <RouterProvider router={router} context={{ queryClient }} />
    </StrictMode>,
);
