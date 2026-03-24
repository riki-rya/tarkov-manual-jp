import type { Metadata } from "next";
import { getTasks, getUnlocksAfterRecord } from "@/lib/data/tasks";
import { TaskChartClientPage } from "@/components/tasks/task-chart-client-page";

export const metadata: Metadata = {
  title: "タスク チャート | Tarkov JP Manual",
  description: "Escape from Tarkov のタスク依存関係をチャートで可視化。",
};

export default function TaskChartPage() {
  return (
    <TaskChartClientPage
      tasks={getTasks()}
      unlocksAfterRecord={getUnlocksAfterRecord()}
    />
  );
}
