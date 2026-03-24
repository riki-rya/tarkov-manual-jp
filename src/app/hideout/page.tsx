import type { Metadata } from "next";
import { getStations } from "@/lib/data/hideout";
import { HideoutClientPage } from "@/components/hideout/hideout-client-page";

export const metadata: Metadata = {
  title: "ハイドアウト | Tarkov JP Manual",
  description: "Escape from Tarkov のハイドアウト建設進捗を管理。必要アイテムの収集状況もトラッキング。",
};

export default function HideoutPage() {
  return <HideoutClientPage stations={getStations()} />;
}
