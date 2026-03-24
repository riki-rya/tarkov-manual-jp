import type { Metadata } from "next";
import { getTasks, getUnlocksAfterRecord, getUniqueTraders, getUniqueMaps } from "@/lib/data/tasks";
import { TasksClientPage } from "@/components/tasks/tasks-client-page";

export const metadata: Metadata = {
  title: "タスク | Tarkov JP Manual",
  description: "Escape from Tarkov の全タスク一覧。トレーダー・マップ・達成状況でフィルタリング可能。",
};

export default function TasksPage() {
  return (
    <TasksClientPage
      tasks={getTasks()}
      unlocksAfterRecord={getUnlocksAfterRecord()}
      uniqueTraders={getUniqueTraders()}
      uniqueMaps={getUniqueMaps()}
    />
  );
}
