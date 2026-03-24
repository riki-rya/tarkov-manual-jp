"use client";

import { useState, useMemo } from "react";
import type { Task, ProgressData } from "@/types/tarkov";

export type SortField = "name" | "level" | "experience";
export type SortOrder = "asc" | "desc";
export type CompletionFilter = "all" | "completed" | "incomplete";

export function useTaskFilters(tasks: Task[], progress: ProgressData) {
  const [search, setSearch] = useState("");
  const [traderFilter, setTraderFilter] = useState("all");
  const [mapFilter, setMapFilter] = useState("all");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const [kappaOnly, setKappaOnly] = useState(false);
  const [lightkeeperOnly, setLightkeeperOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("level");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.trader.name.toLowerCase().includes(q) ||
          t.objectives.some((o) => o.description.toLowerCase().includes(q))
      );
    }

    if (traderFilter !== "all")
      result = result.filter((t) => t.trader.name === traderFilter);
    if (mapFilter !== "all")
      result = result.filter((t) => t.map?.name === mapFilter);

    if (completionFilter === "completed")
      result = result.filter((t) => progress.tasks[t.id]?.completed);
    else if (completionFilter === "incomplete")
      result = result.filter((t) => !progress.tasks[t.id]?.completed);

    if (kappaOnly) result = result.filter((t) => t.kappaRequired);
    if (lightkeeperOnly) result = result.filter((t) => t.lightkeeperRequired);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "level") cmp = a.minPlayerLevel - b.minPlayerLevel;
      else if (sortField === "experience") cmp = a.experience - b.experience;
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    tasks,
    search,
    traderFilter,
    mapFilter,
    completionFilter,
    kappaOnly,
    lightkeeperOnly,
    sortField,
    sortOrder,
    progress,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return {
    search,
    setSearch,
    traderFilter,
    setTraderFilter,
    mapFilter,
    setMapFilter,
    completionFilter,
    setCompletionFilter,
    kappaOnly,
    setKappaOnly,
    lightkeeperOnly,
    setLightkeeperOnly,
    sortField,
    sortOrder,
    filteredTasks,
    toggleSort,
  };
}
