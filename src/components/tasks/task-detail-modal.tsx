"use client";

import type { Task } from "@/types/tarkov";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useProgress } from "@/lib/storage/progress-context";
import { ClipboardList, Lightbulb, ArrowRight, ExternalLink } from "lucide-react";

// オブジェクティブタイプの日本語ラベル
const OBJECTIVE_TYPE_LABELS: Record<string, string> = {
  visit: "訪問",
  giveItem: "引き渡し",
  findItem: "発見",
  giveQuestItem: "引き渡し",
  findQuestItem: "発見",
  plantItem: "設置",
  plantQuestItem: "設置",
  shoot: "殺害",
  extract: "脱出",
  mark: "マーク",
  buildWeapon: "武器構築",
  skill: "スキル",
  traderLevel: "トレーダー",
  playerLevel: "レベル",
  experience: "経験値",
  taskStatus: "タスク",
};

function getObjectiveTypeLabel(type: string): string {
  return OBJECTIVE_TYPE_LABELS[type] ?? type;
}

// タスクの内容に応じた攻略ヒントを生成
function generateHints(task: Task): { label: string; text: string }[] {
  const hints: { label: string; text: string }[] = [];
  const types = new Set(task.objectives.map((o) => o.type));

  if (task.map) {
    hints.push({
      label: "マップ",
      text: `${task.map.name} で実施するタスクです。`,
    });
  }

  const hasGiveWithFIR = task.objectives.some(
    (o) =>
      (o.type === "giveItem" || o.type === "giveQuestItem") &&
      "foundInRaid" in o &&
      (o as { foundInRaid: boolean }).foundInRaid
  );
  if (hasGiveWithFIR) {
    hints.push({
      label: "引き渡し",
      text: "アイテムをトレーダーに渡す必要があります。FiR（レイド中に発見）品が必要な場合があります。",
    });
  } else if (types.has("giveItem") || types.has("giveQuestItem")) {
    hints.push({
      label: "引き渡し",
      text: "アイテムをトレーダーに渡す必要があります。",
    });
  }

  if (types.has("visit") || types.has("findQuestItem")) {
    hints.push({
      label: "探索",
      text: "特定の場所を訪問する必要があります。ルートを計画してから出撃しましょう。",
    });
  }

  if (types.has("shoot")) {
    hints.push({
      label: "殺害",
      text: "特定のターゲットを倒す必要があります。",
    });
  }

  if (types.has("extract")) {
    hints.push({
      label: "脱出",
      text: "特定の脱出ポイントから脱出する必要があります。",
    });
  }

  if (types.has("findItem")) {
    hints.push({
      label: "アイテム発見",
      text: "特定のアイテムをレイド中に見つける必要があります。",
    });
  }

  return hints;
}

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unlocksAfter: Task[];
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  unlocksAfter,
}: TaskDetailModalProps) {
  const { progress, toggleTask } = useProgress();

  if (!task) return null;

  const isCompleted = progress.tasks[task.id]?.completed ?? false;
  const hints = generateHints(task);
  const wikiUrl = `https://wikiwiki.jp/eft/${encodeURIComponent(task.trader.name)}/${encodeURIComponent(task.name)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-2 pr-8">
            <DialogTitle className="text-xl font-bold">{task.name}</DialogTitle>
            {task.kappaRequired && (
              <Badge className="bg-amber-600 text-white">Kappa</Badge>
            )}
            {task.lightkeeperRequired && (
              <Badge className="bg-yellow-500 text-black">LK</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{task.name}</p>

          {/* 情報タグ */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {task.trader.name}
            </Badge>
            {task.map && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                {task.map.name}
              </Badge>
            )}
            <Badge variant="outline" className="text-sm px-3 py-1">
              必要レベル: {task.minPlayerLevel}
            </Badge>
          </div>
        </DialogHeader>

        {/* スクロール可能なコンテンツ */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">
            {/* 目標セクション */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                目標
              </h3>
              <div className="space-y-2">
                {task.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <Badge className="bg-amber-600 text-white shrink-0 text-[11px] px-2 py-0.5 mt-0.5">
                      {getObjectiveTypeLabel(obj.type)}
                    </Badge>
                    <p className="text-sm leading-relaxed">
                      {obj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* このタスク完了後にアンロック */}
            {unlocksAfter.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  このタスク完了後にアンロック
                </h3>
                <div className="space-y-2">
                  {unlocksAfter.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5"
                    >
                      <span className="text-sm">{t.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {t.trader.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 攻略ヒント */}
            {hints.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  攻略ヒント
                </h3>
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  {hints.map((hint, i) => (
                    <p key={i} className="text-sm">
                      <span className="text-amber-500 font-medium">
                        {hint.label}:
                      </span>{" "}
                      {hint.text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Wiki リンク */}
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg border bg-muted/30 px-4 py-3 text-sm text-primary hover:bg-muted/60 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Wiki で詳細な攻略情報を見る
            </a>
          </div>
        </div>

        {/* フッター: 完了切替 + 閉じる */}
        <div className="flex gap-3 px-6 py-4 border-t shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => toggleTask(task.id)}
          >
            {isCompleted ? "未完了に戻す" : "完了にする"}
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
