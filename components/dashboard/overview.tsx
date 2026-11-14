"use client";

import {
  CheckCircle2,
  Clock3,
  FolderGit2,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import RecentChattedRepos from "@/components/dashboard/RecentChattedRepos";
import RecentlyIndexedRepos from "@/components/dashboard/RecentlyIndexedRepos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRepositories } from "@/hooks/use-repositories";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.35,
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export default function Overview() {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const {
    data: repositories = [],
    isPending,
    isError,
    error,
    refetch,
  } = useRepositories();

  const stats = useMemo(
    () => [
      {
        label: "Total repositories",
        value: repositories.length,
        icon: FolderGit2,
      },
      {
        label: "Indexed",
        value: repositories.filter((repo) => repo.indexStatus === "DONE").length,
        icon: CheckCircle2,
      },
      {
        label: "Indexing",
        value: repositories.filter((repo) => repo.indexStatus === "INDEXING").length,
        icon: Clock3,
      },
      {
        label: "Failed",
        value: repositories.filter((repo) => repo.indexStatus === "FAILED").length,
        icon: XCircle,
      },
    ],
    [repositories]
  );

  const initialState = shouldReduceMotion ? false : "hidden";

  if (isPending) {
    return (
      <main className="page-background flex min-h-screen items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading your overview...
      </main>
    );
  }

  if (isError) {
    return (
      <main className="page-background min-h-screen p-4 md:p-8">
        <div
          role="alert"
          className="max-w-2xl rounded-xl border border-destructive/30 bg-white p-5"
        >
          <h2 className="font-semibold text-zinc-900">
            Could not load your overview
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <motion.main
      className="page-background mx-auto min-h-screen space-y-8 p-4 md:p-8"
      variants={pageVariants}
      initial={initialState}
      animate="visible"
    >
      {/* Welcome */}
      <motion.section variants={sectionVariants}>
        <p className="mb-2 text-sm font-medium text-slate-500">
          Your workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Welcome back, {user?.displayName || user?.githubusername} 👋
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Here's what's happening across your repositories.
        </p>
      </motion.section>

      {/* Overview statistics */}
      <motion.section
        className="space-y-4"
        variants={sectionVariants}
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A quick look at your repository activity.
          </p>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          variants={cardGridVariants}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                variants={sectionVariants}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -3,
                        transition: { duration: 0.2, ease: "easeOut" },
                      }
                }
              >
                <Card className="h-full rounded-xl border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <Icon className="size-5 text-slate-700" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Recent repository activity */}
      <motion.section
        className="space-y-8"
        variants={sectionVariants}
      >
        <motion.div variants={sectionVariants}>
          <RecentlyIndexedRepos />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <RecentChattedRepos />
        </motion.div>
      </motion.section>
    </motion.main>
  );
}
