import { Link, useRouterState } from "@tanstack/react-router";
import { WrenchIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { ApiStatus } from "@/shared/components/api-status";
import { ThemeToggle } from "@/shared/components/theme-toggle";

export type AppShellProps = Readonly<{
    children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    });

    useEffect(() => {
        document.querySelector<HTMLElement>("#main-content")?.focus();
    }, [pathname]);

    return (
        <div className="min-h-svh bg-background text-foreground">
            <a
                href="#main-content"
                className="sr-only fixed top-3 left-3 z-50 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground focus:not-sr-only"
            >
                Skip to content
            </a>
            <header className="border-b bg-card">
                <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="flex min-h-11 min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center border bg-primary text-primary-foreground">
                            <WrenchIcon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-heading text-base font-semibold tracking-tight">
                                Maintenance Workflow Console
                            </span>
                            <span className="block text-xs font-medium tracking-wide text-muted-foreground">
                                Plant operations
                            </span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ApiStatus />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main
                id="main-content"
                tabIndex={-1}
                className="mx-auto w-full max-w-7xl px-4 py-8 outline-none sm:px-6 sm:py-10 lg:px-8"
            >
                {children}
            </main>
            <footer className="border-t">
                <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
                    Workflow processing and email delivery remain on the API.
                </div>
            </footer>
        </div>
    );
}
