"use client";

import { motion, useReducedMotion } from "motion/react";
import { RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import RepositoryCard from "@/components/repositories/repository-card";
import RepositoryFilters, {
    type RepositoryFilter,
} from "@/components/repositories/repository-filters";
import {
    useRepositories,
    useStartRepositoryIndexing,
    useSyncRepositories,
} from "@/hooks/use-repositories";

import type { Repository } from "@/types/repository";

const PAGE_SIZE = 9;

const pageVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as const,
            staggerChildren: 0.07,
        },
    },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const gridVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.055, delayChildren: 0.04 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
    },
};

function PageHeading({ compact = false }: { compact?: boolean }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">GitHub</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Repositories
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
                {compact
                    ? "Manage your GitHub repositories."
                    : "Manage your repositories, check indexing status, and prepare code for intelligent search."}
            </p>
        </div>
    );
}

function PageShell({
    children,
    reduceMotion,
}: {
    children: ReactNode;
    reduceMotion: boolean;
}) {
    return (
        <motion.main
            className="page-background min-h-screen space-y-7 px-5 py-8 text-slate-900 sm:px-8 lg:px-12 xl:px-16 2xl:px-20"
            variants={pageVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
        >
            {children}
        </motion.main>
    );
}

export default function RepositoriesPage() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    const {
        data: repositories = [],
        isPending,
        isError,
        error,
        refetch,
        isFetching,
    } = useRepositories();

    const {
        mutate: startIndexing,
        isPending: isStartingIndexing,
    } = useStartRepositoryIndexing();

    const {
        mutate: syncRepositories,
        isPending: isSyncing,
        error: syncError,
    } = useSyncRepositories();

    const [activeFilter, setActiveFilter] =
        useState<RepositoryFilter>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery]);

    const filteredRepositories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return repositories.filter((repository) => {
            const matchesSearch =
                !query ||
                [
                    repository.name,
                    repository.fullName,
                    repository.description,
                    repository.owner,
                    repository.language,
                ].some((value) => value?.toLowerCase().includes(query));

            if (!matchesSearch) return false;

            switch (activeFilter) {
                case "PUBLIC":
                    return !repository.isPrivate;
                case "PRIVATE":
                    return repository.isPrivate;
                case "COMPLETED":
                    return repository.indexStatus === "DONE";
                case "PENDING":
                case "INDEXING":
                case "FAILED":
                    return repository.indexStatus === activeFilter;
                default:
                    return true;
            }
        });
    }, [repositories, activeFilter, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredRepositories.length / PAGE_SIZE));
    const paginatedRepositories = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredRepositories.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredRepositories, currentPage]);

    const firstVisibleRepository =
        filteredRepositories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastVisibleRepository = Math.min(
        currentPage * PAGE_SIZE,
        filteredRepositories.length
    );

    function handleIndex(repository: Repository) {
        if (isStartingIndexing) return;
        startIndexing(repository.id);
    }

    function handleChatClick(repository: Repository) {
        router.push(`/chat/${encodeURIComponent(repository.id)}`);
    }

    function clearFilters() {
        setSearchQuery("");
        setActiveFilter("ALL");
    }

    const errorMessage =
        error instanceof Error
            ? error.message
            : "An unexpected error occurred.";

    const syncErrorMessage =
        syncError instanceof Error
            ? syncError.message
            : "Could not sync repositories. Try again.";

    if (isPending) {
        return (
            <PageShell reduceMotion={Boolean(shouldReduceMotion)}>
                <motion.section variants={sectionVariants}>
                    <PageHeading />
                </motion.section>

                <motion.div
                    variants={sectionVariants}
                    className="flex min-h-60 items-center justify-center"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                        Loading repositories...
                    </div>
                </motion.div>
            </PageShell>
        );
    }

    if (isError) {
        return (
            <PageShell reduceMotion={Boolean(shouldReduceMotion)}>
                <motion.section variants={sectionVariants}>
                    <PageHeading compact />
                </motion.section>

                <motion.section
                    variants={sectionVariants}
                    className="max-w-2xl rounded-2xl border border-red-200 bg-white/80 p-6 shadow-sm"
                    aria-labelledby="repository-error-title"
                >
                    <h2
                        id="repository-error-title"
                        className="font-semibold text-slate-900"
                    >
                        Failed to load repositories
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {errorMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={isFetching ? "animate-spin" : ""}
                        />
                        Retry
                    </button>
                </motion.section>
            </PageShell>
        );
    }

    return (
        <PageShell reduceMotion={Boolean(shouldReduceMotion)}>
            {/* Heading with compact search and sync toolbar */}
            <motion.section
                variants={sectionVariants}
                className="space-y-3"
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <PageHeading />

                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-[520px]">
                        <div className="relative min-w-0 flex-1">
                            <label htmlFor="repository-search" className="sr-only">
                                Search repositories
                            </label>
                            <Search
                                size={17}
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                id="repository-search"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search repositories..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white/90 pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear repository search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => syncRepositories()}
                            disabled={isSyncing}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={15}
                                className={isSyncing ? "animate-spin" : ""}
                            />
                            {isSyncing ? "Syncing..." : "Sync"}
                        </button>
                    </div>
                </div>

                {syncError && (
                    <p role="alert" className="text-sm text-red-600">
                        {syncErrorMessage}
                    </p>
                )}
            </motion.section>

            {/* Filters */}
            <motion.section variants={sectionVariants}>
                <RepositoryFilters
                    repositories={repositories}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            </motion.section>

            {/* Results summary */}
            <motion.div
                variants={sectionVariants}
                className="flex items-center justify-between gap-3"
            >
                <p className="text-sm text-slate-500" aria-live="polite">
                    Showing{" "}
                    <span className="font-semibold text-slate-900">
                        {filteredRepositories.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-900">
                        {repositories.length}
                    </span>{" "}
                    repositories
                </p>

                {(searchQuery || activeFilter !== "ALL") && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                        Clear filters
                    </button>
                )}
            </motion.div>

            {/* Repository cards */}
            {filteredRepositories.length === 0 ? (
                <motion.section
                    variants={sectionVariants}
                    className="rounded-2xl border border-dashed border-slate-300 bg-white/55 px-6 py-14 text-center"
                >
                    <Search
                        aria-hidden="true"
                        className="mx-auto h-8 w-8 text-slate-400"
                    />
                    <h2 className="mt-4 font-semibold text-slate-900">
                        {searchQuery.trim()
                            ? "No matching repositories"
                            : "No repositories found"}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        {searchQuery.trim()
                            ? "Try another search term or change your selected filter."
                            : "Sync your GitHub repositories to load them here."}
                    </p>

                    {searchQuery.trim() ? (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Clear search and filters
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => syncRepositories()}
                            disabled={isSyncing}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={16}
                                className={isSyncing ? "animate-spin" : ""}
                            />
                            {isSyncing ? "Syncing..." : "Sync repositories"}
                        </button>
                    )}
                </motion.section>
            ) : (
                <motion.section
                    variants={gridVariants}
                    className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    aria-label="Repositories"
                >
                    {paginatedRepositories.map((repository) => (
                        <motion.div
                            key={repository.id}
                            variants={cardVariants}
                            whileHover={
                                shouldReduceMotion ? undefined : { y: -3 }
                            }
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <RepositoryCard
                                repository={repository}
                                onIndex={handleIndex}
                                onChat={handleChatClick}
                            />
                        </motion.div>
                    ))}
                </motion.section>
            )}

            {filteredRepositories.length > 0 && (
                <motion.nav
                    variants={sectionVariants}
                    aria-label="Repository pagination"
                    className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-sm text-slate-500" aria-live="polite">
                        Showing{" "}
                        <span className="font-medium text-slate-800">
                            {firstVisibleRepository}–{lastVisibleRepository}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-800">
                            {filteredRepositories.length}
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="min-w-20 text-center text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) => Math.min(totalPages, page + 1))
                            }
                            disabled={currentPage >= totalPages}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </motion.nav>
            )}
        </PageShell>
    );
}
