import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

export const queryClient = createQueryClient();
