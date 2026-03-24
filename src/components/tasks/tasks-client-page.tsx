"use client";

import { useState } from "react";
import type { Task } from "@/types/tarkov";
import { Button } from "@/components/ui/button";
import { GitBranch, List } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/lib/storage/progress-context";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFilters } from "@/components/tasks/task-filters";
import { useTaskFilters } from "@/hooks/use-task-filters";

interface TasksClientPageProps {
  tasks: Task[];
  unlocksAfterRecord: Record<string, Task[]>;
  uniqueTraders: string[];
  uniqueMaps: string[];
}

export function TasksClientPage({
  tasks,
  unlocksAfterRecord,
  uniqueTraders,
  uniqueMaps,
}: TasksClientPageProps) {
  const { progress, toggleTask } = useProgress();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const {
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
    filteredTasks,
    toggleSort,
  } = useTaskFilters(tasks, progress);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">タスク</h1>
        <span className="text-sm text-muted-foreground">
          {filteredTasks.length}件のタスクを表示中
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="gap-1.5">
          <List className="h-4 w-4" />
          リスト
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href="/tasks/chart">
            <GitBranch className="h-4 w-4" />
            チャート
          </Link>
        </Button>
      </div>

      <TaskFilters
        uniqueTraders={uniqueTraders}
        uniqueMaps={uniqueMaps}
        search={search}
        traderFilter={traderFilter}
        mapFilter={mapFilter}
        completionFilter={completionFilter}
        kappaOnly={kappaOnly}
        lightkeeperOnly={lightkeeperOnly}
        sortField={sortField}
        onSearchChange={setSearch}
        onTraderChange={setTraderFilter}
        onMapChange={setMapFilter}
        onCompletionChange={setCompletionFilter}
        onKappaChange={setKappaOnly}
        onLightkeeperChange={setLightkeeperOnly}
        onSortToggle={toggleSort}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleted={progress.tasks[task.id]?.completed ?? false}
            onToggle={() => toggleTask(task.id)}
            onOpenModal={() => openModal(task)}
          />
        ))}
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
          selectedTask ? (unlocksAfterRecord[selectedTask.id] ?? []) : []
        }
      />
    </div>
  );
}
