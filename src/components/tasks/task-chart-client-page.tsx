"use client";

import { useMemo, useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Task } from "@/types/tarkov";
import { useProgress } from "@/lib/storage/progress-context";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { Button } from "@/components/ui/button";
import { List, GitBranch } from "lucide-react";
import Link from "next/link";
import { TRADER_COLORS } from "@/lib/data/traders";

interface TaskChartClientPageProps {
  tasks: Task[];
  unlocksAfterRecord: Record<string, Task[]>;
}

function buildGraph(
  allTasks: Task[],
  completedTasks: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const taskMap = new Map(allTasks.map((t) => [t.id, t]));
  const hasRelation = new Set<string>();
  for (const t of allTasks) {
    if (t.taskRequirements.length > 0) {
      hasRelation.add(t.id);
      for (const req of t.taskRequirements) {
        hasRelation.add(req.task.id);
      }
    }
  }

  const relevantTasks = allTasks.filter((t) => hasRelation.has(t.id));
  const levels = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const t of relevantTasks) {
    if (!children.has(t.id)) children.set(t.id, []);
    for (const req of t.taskRequirements) {
      if (!children.has(req.task.id)) children.set(req.task.id, []);
      children.get(req.task.id)!.push(t.id);
    }
  }

  const roots = relevantTasks.filter((t) => t.taskRequirements.length === 0);
  const queue = roots.map((t) => ({ id: t.id, level: 0 }));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) {
      levels.set(id, Math.max(levels.get(id) || 0, level));
      continue;
    }
    visited.add(id);
    levels.set(id, level);
    for (const childId of children.get(id) || []) {
      queue.push({ id: childId, level: level + 1 });
    }
  }

  for (const t of relevantTasks) {
    if (!levels.has(t.id)) levels.set(t.id, 0);
  }

  const levelGroups = new Map<number, string[]>();
  for (const [id, level] of levels) {
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(id);
  }

  const nodes: Node[] = [];
  for (const [level, ids] of levelGroups) {
    ids.forEach((id, index) => {
      const task = taskMap.get(id);
      if (!task) return;
      const isCompleted = completedTasks.has(id);
      const color = TRADER_COLORS[task.trader.name] || "#666";

      nodes.push({
        id,
        position: { x: level * 280, y: index * 80 },
        data: { label: task.name },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: isCompleted ? "#333" : color,
          color: isCompleted ? "#888" : "#fff",
          border: isCompleted ? "1px solid #555" : `2px solid ${color}`,
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "11px",
          maxWidth: "200px",
          opacity: isCompleted ? 0.5 : 1,
        },
      });
    });
  }

  const edges: Edge[] = [];
  for (const t of relevantTasks) {
    for (const req of t.taskRequirements) {
      if (hasRelation.has(req.task.id)) {
        edges.push({
          id: `${req.task.id}-${t.id}`,
          source: req.task.id,
          target: t.id,
          animated: !completedTasks.has(t.id),
          style: {
            stroke: completedTasks.has(t.id) ? "#555" : "#d4a574",
          },
        });
      }
    }
  }

  return { nodes, edges };
}

export function TaskChartClientPage({
  tasks,
  unlocksAfterRecord,
}: TaskChartClientPageProps) {
  const { progress } = useProgress();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const completedTasks = useMemo(
    () =>
      new Set(
        Object.entries(progress.tasks)
          .filter(([, t]) => t.completed)
          .map(([id]) => id)
      ),
    [progress]
  );

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(tasks, completedTasks),
    [tasks, completedTasks]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const task = tasks.find((t) => t.id === node.id);
      if (task) {
        setSelectedTask(task);
        setModalOpen(true);
      }
    },
    [tasks]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">タスク チャート</h1>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href="/tasks">
            <List className="h-4 w-4" />
            リスト
          </Link>
        </Button>
        <Button variant="secondary" size="sm" className="gap-1.5">
          <GitBranch className="h-4 w-4" />
          チャート
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(TRADER_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded" style={{ background: color }} />
            {name}
          </div>
        ))}
      </div>

      <div className="h-[calc(100vh-220px)] rounded-lg border border-border bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color="#333" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

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
