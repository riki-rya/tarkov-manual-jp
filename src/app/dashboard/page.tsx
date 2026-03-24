import type { Metadata } from "next";
import { getTasks } from "@/lib/data/tasks";
import { getStations } from "@/lib/data/hideout";
import { DashboardClientPage } from "@/components/dashboard/dashboard-client-page";

export const metadata: Metadata = {
  title: "ダッシュボード | Tarkov JP Manual",
  description: "Escape from Tarkov の進捗ダッシュボード。タスク・ハイドアウトの達成状況を一覧確認。",
};

export default function DashboardPage() {
  return (
    <DashboardClientPage
      tasks={getTasks()}
      stations={getStations()}
    />
  );
}
