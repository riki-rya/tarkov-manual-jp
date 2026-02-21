"use client";

import { useState, useMemo } from "react";
import type { Task } from "@/types/tarkov";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProgress } from "@/lib/storage/progress-context";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import {
  Search,
  ArrowUpDown,
  GitBranch,
  List,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import taskData from "../../../data/task.json";

const tasks: Task[] = taskData.tasks as Task[];

// 完了後にアンロックされるタスクの逆引きマップ
const unlocksAfterMap = new Map<string, Task[]>();
tasks.forEach((task) => {
  task.taskRequirements.forEach((req) => {
    const existing = unlocksAfterMap.get(req.task.id) ?? [];
    existing.push(task);
    unlocksAfterMap.set(req.task.id, existing);
  });
});

const uniqueTraders = Array.from(
  new Set(tasks.map((t) => t.trader.name))
).sort();
const uniqueMaps = Array.from(
  new Set(
    tasks
      .filter((t) => t.map)
      .map((t) => t.map!.name)
  )
).sort();

type SortField = "name" | "level" | "experience";
type SortOrder = "asc" | "desc";
type CompletionFilter = "all" | "completed" | "incomplete";

export default function TasksPage() {
  const { progress, toggleTask } = useProgress();
  const [search, setSearch] = useState("");
  const [traderFilter, setTraderFilter] = useState<string>("all");
  const [mapFilter, setMapFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const [kappaOnly, setKappaOnly] = useState(false);
  const [lightkeeperOnly, setLightkeeperOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("level");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

    if (traderFilter !== "all") {
      result = result.filter((t) => t.trader.name === traderFilter);
    }

    if (mapFilter !== "all") {
      result = result.filter((t) => t.map?.name === mapFilter);
    }

    if (completionFilter === "completed") {
      result = result.filter((t) => progress.tasks[t.id]?.completed);
    } else if (completionFilter === "incomplete") {
      result = result.filter((t) => !progress.tasks[t.id]?.completed);
    }

    if (kappaOnly) {
      result = result.filter((t) => t.kappaRequired);
    }

    if (lightkeeperOnly) {
      result = result.filter((t) => t.lightkeeperRequired);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "level") {
        cmp = a.minPlayerLevel - b.minPlayerLevel;
      } else if (sortField === "experience") {
        cmp = a.experience - b.experience;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
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

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <span className="text-sm text-muted-foreground">
          {filteredTasks.length}件のタスクを表示中
        </span>
      </div>

      {/* View switcher */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="gap-1.5">
          <List className="h-4 w-4" />
          List
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href="/tasks/chart">
            <GitBranch className="h-4 w-4" />
            Chart
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="タスク名・トレーダー名・目標で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={traderFilter} onValueChange={setTraderFilter}>
          <SelectTrigger>
            <SelectValue placeholder="トレーダー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全トレーダー</SelectItem>
            {uniqueTraders.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mapFilter} onValueChange={setMapFilter}>
          <SelectTrigger>
            <SelectValue placeholder="マップ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全マップ</SelectItem>
            {uniqueMaps.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={completionFilter}
          onValueChange={(v) => setCompletionFilter(v as CompletionFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            <SelectItem value="completed">完了済み</SelectItem>
            <SelectItem value="incomplete">未完了</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={kappaOnly}
              onCheckedChange={(c) => setKappaOnly(c === true)}
            />
            KAPPA
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={lightkeeperOnly}
              onCheckedChange={(c) => setLightkeeperOnly(c === true)}
            />
            LK
          </label>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2">
        {(
          [
            ["name", "名前"],
            ["level", "レベル"],
            ["experience", "XP"],
          ] as [SortField, string][]
        ).map(([field, label]) => (
          <Button
            key={field}
            variant={sortField === field ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleSort(field)}
          >
            {label}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ))}
      </div>

      {/* Task list - 2列グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTasks.map((task) => {
          const isCompleted = progress.tasks[task.id]?.completed ?? false;
          const visibleObjectives = task.objectives
            .filter((o) => !o.optional)
            .slice(0, 3);
          const remainingCount =
            task.objectives.filter((o) => !o.optional).length -
            visibleObjectives.length;

          return (
            <Card
              key={task.id}
              className={`transition-colors ${isCompleted ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 左: チェックボックス */}
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5 shrink-0"
                  />

                  {/* 中央: タスク情報 */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => openModal(task)}
                  >
                    {/* タスク名 + バッジ */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-sm ${
                          isCompleted
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.name}
                      </span>
                      {task.kappaRequired && (
                        <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0">
                          Kappa
                        </Badge>
                      )}
                      {task.lightkeeperRequired && (
                        <Badge className="bg-yellow-500 text-black text-[10px] px-1.5 py-0">
                          LK
                        </Badge>
                      )}
                    </div>

                    {/* サブタイトル */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.name}
                    </p>

                    {/* タグ行: トレーダー / マップ / レベル */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] px-2 py-0.5"
                      >
                        {task.trader.name}
                      </Badge>
                      {task.map && (
                        <Badge
                          variant="outline"
                          className="text-[11px] px-2 py-0.5"
                        >
                          {task.map.name}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[11px] px-2 py-0.5"
                      >
                        Lv.{task.minPlayerLevel}
                      </Badge>
                    </div>

                    {/* 目標リスト */}
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        目標:
                      </p>
                      <ul className="space-y-0.5">
                        {visibleObjectives.map((obj) => (
                          <li
                            key={obj.id}
                            className="text-xs text-muted-foreground flex items-start gap-1"
                          >
                            <span className="shrink-0 mt-px">•</span>
                            <span>{obj.description}</span>
                          </li>
                        ))}
                        {remainingCount > 0 && (
                          <li className="text-xs text-muted-foreground">
                            ...他{remainingCount}件
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* 右: 詳細矢印 */}
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-pointer"
                    onClick={() => openModal(task)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          条件に一致するタスクが見つかりません。
        </div>
      )}

      <TaskDetailModal
        task={selectedTask}
        open={modalOpen}
        onOpenChange={setModalOpen}
        unlocksAfter={
          selectedTask ? (unlocksAfterMap.get(selectedTask.id) ?? []) : []
        }
      />
    </div>
  );
}
