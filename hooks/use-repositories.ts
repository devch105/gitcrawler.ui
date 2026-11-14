
"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { sileo } from "sileo";

import {
    fetchRepositories,
    startRepositoryIndexing,
    syncRepositories,
} from "@/lib/api/repositories";

import type { Repository } from "@/types/repository";

const REPOSITORIES_KEY = ["repositories"] as const;
const INDEXING_POLL_MS = 2000;

export function useRepositories() {
    return useQuery<Repository[]>({
        queryKey: REPOSITORIES_KEY,
        queryFn: fetchRepositories,

        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,

        refetchInterval: (query) => {
            if (query.state.status === "error") {
                return false;
            }

            const repositories = query.state.data;

            const isIndexing = repositories?.some(
                (repository) => repository.indexStatus === "INDEXING"
            );

            return isIndexing ? INDEXING_POLL_MS : false;
        },
    });
}

export function useSyncRepositories() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: syncRepositories,

        onSuccess: (repositories) => {
            queryClient.setQueryData<Repository[]>(
                REPOSITORIES_KEY,
                repositories
            );

            sileo.success({
                title: "Repositories synced",
                description: `${repositories.length} repositories are up to date.`,
            });
        },

        onError: () => {
            sileo.error({
                title: "Sync failed",
                description: "Unable to sync repositories. Please try again.",
            });
        },
    });
}

export function useStartRepositoryIndexing() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: startRepositoryIndexing,

        onSuccess: (repository) => {
            queryClient.setQueryData<Repository[]>(
                REPOSITORIES_KEY,
                (repositories) =>
                    repositories?.map((repo) =>
                        repo.id === repository.id ? repository : repo
                    )
            );

            sileo.success({
                title: "Indexing started",
                description: `${repository.name} is being indexed.`,
            });
        },

        onError: (error) => {
            queryClient.invalidateQueries({
                queryKey: REPOSITORIES_KEY,
            });

            sileo.error({
                title: "Indexing failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not start repository indexing.",
            });
        },
    });
}
