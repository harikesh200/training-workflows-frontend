import { QueryClientProvider } from "@tanstack/react-query";
import {
    createRootRouteWithContext,
    Link,
    Outlet,
    type ErrorComponentProps,
} from "@tanstack/react-router";
import { AlertTriangleIcon, LoaderCircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { RouterContext } from "@/app/router-context";
import { AppShell } from "@/shared/components/app-shell";
import { ThemeProvider } from "@/shared/components/theme-provider";

function GlobalPending() {
    return (
        <div
            className="flex min-h-svh items-center justify-center gap-3 bg-background text-sm text-muted-foreground"
            role="status"
        >
            <LoaderCircleIcon
                className="motion-safe:animate-spin motion-reduce:animate-none"
                aria-hidden="true"
            />
            Loading console…
        </div>
    );
}

function GlobalRouteError({ reset }: ErrorComponentProps) {
    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-4">
            <section
                className="w-full max-w-lg space-y-5 border bg-card p-6"
                role="alert"
            >
                <AlertTriangleIcon
                    className="size-6 text-destructive"
                    aria-hidden="true"
                />
                <h1 className="font-heading text-page-title font-semibold">
                    Console error
                </h1>
                <p className="text-base/7 text-muted-foreground">
                    The page could not be rendered. Retry or return to workflow
                    dispatch.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" className="min-h-11" onClick={reset}>
                        Retry
                    </Button>
                    <Button asChild variant="outline" className="min-h-11">
                        <Link to="/">Return home</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}

function GlobalNotFound() {
    return (
        <section className="mx-auto max-w-2xl space-y-5 border bg-card p-6">
            <p className="text-xs text-muted-foreground">404</p>
            <h1 className="font-heading text-page-title font-semibold">
                Page not found
            </h1>
            <p className="text-base/7 text-muted-foreground">
                This console route does not exist.
            </p>
            <Button asChild className="min-h-11">
                <Link to="/">Return to workflow dispatch</Link>
            </Button>
        </section>
    );
}

type RootProvidersProps = Readonly<{
    children: ReactNode;
}>;

function RootProviders({ children }: RootProvidersProps) {
    const { queryClient } = Route.useRouteContext();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

function RootComponent() {
    return (
        <RootProviders>
            <AppShell>
                <Outlet />
            </AppShell>
        </RootProviders>
    );
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
    pendingComponent: GlobalPending,
    errorComponent: GlobalRouteError,
    notFoundComponent: GlobalNotFound,
});
