"use client";

import { useState, useMemo } from "react";
import type { HideoutStation, HideoutLevel } from "@/types/tarkov";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProgress } from "@/lib/storage/progress-context";
import {
  Clock,
  Wrench,
  GraduationCap,
  ShoppingBag,
  List,
  Package,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import hideoutData from "../../../data/hideout.json";

const stations: HideoutStation[] =
  hideoutData.hideoutStations as HideoutStation[];

type StatusFilter = "all" | "completed" | "incomplete";
type PageView = "stations" | "items";
type ItemsFilter = "incomplete" | "all";

function formatTime(seconds: number): string {
  if (seconds === 0) return "Instant";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function isFIRRequired(attributes?: { name: string; value: string }[]): boolean {
  return (
    attributes?.some(
      (a) => a.name === "foundInRaid" && (a.value === "true" || a.value === "1")
    ) ?? false
  );
}

// ──────────────────────────────────────────────
// ステーション詳細コンポーネント（既存）
// ──────────────────────────────────────────────
function LevelDetail({
  station,
  level,
}: {
  station: HideoutStation;
  level: HideoutLevel;
}) {
  const { progress, toggleHideoutLevel } = useProgress();
  const isCompleted =
    progress.hideout[station.id]?.[level.level]?.completed ?? false;

  return (
    <div className={`space-y-3 ${isCompleted ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => toggleHideoutLevel(station.id, level.level)}
          />
          <span className="font-medium text-sm">Level {level.level}</span>
          {isCompleted && (
            <Badge variant="secondary" className="text-[10px]">
              Completed
            </Badge>
          )}
        </div>
        {level.constructionTime > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(level.constructionTime)}
          </div>
        )}
      </div>

      {level.description && (
        <p className="text-xs text-muted-foreground">{level.description}</p>
      )}

      {level.itemRequirements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />
            Items Required
          </h4>
          <div className="space-y-1">
            {level.itemRequirements.map((req, i) => {
              const fir = isFIRRequired(req.attributes);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1.5"
                >
                  {req.item.iconLink && (
                    <img
                      src={req.item.iconLink}
                      alt={req.item.name}
                      className="h-8 w-8 object-contain"
                    />
                  )}
                  <span className="text-sm flex-1">{req.item.name}</span>
                  {fir && (
                    <Badge variant="destructive" className="text-[10px]">
                      FIR
                    </Badge>
                  )}
                  <span className="text-sm font-mono">x{req.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {level.stationLevelRequirements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            Station Requirements
          </h4>
          <div className="space-y-1">
            {level.stationLevelRequirements.map((req, i) => (
              <div key={i} className="text-sm rounded bg-muted/50 px-2 py-1.5">
                {req.station.name} Level {req.level}
              </div>
            ))}
          </div>
        </div>
      )}

      {level.skillRequirements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            Skill Requirements
          </h4>
          <div className="space-y-1">
            {level.skillRequirements.map((req, i) => (
              <div key={i} className="text-sm rounded bg-muted/50 px-2 py-1.5">
                {req.name} Level {req.level}
              </div>
            ))}
          </div>
        </div>
      )}

      {level.traderRequirements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">
            Trader Requirements
          </h4>
          <div className="space-y-1">
            {level.traderRequirements.map((req, i) => (
              <div key={i} className="text-sm rounded bg-muted/50 px-2 py-1.5">
                {req.trader.name} LL{req.level}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// アイテム行コンポーネント
// ──────────────────────────────────────────────
interface AggregatedItem {
  key: string;
  itemId: string;
  itemName: string;
  iconLink: string;
  isFIR: boolean;
  totalNeeded: number;
}

function ItemCountRow({
  item,
  count,
  onCountChange,
}: {
  item: AggregatedItem;
  count: number;
  onCountChange: (count: number) => void;
}) {
  const isComplete = count >= item.totalNeeded;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
        isComplete ? "opacity-50 bg-muted/20" : "bg-card"
      }`}
    >
      {/* アイコン */}
      <div className="h-9 w-9 shrink-0 flex items-center justify-center">
        {item.iconLink ? (
          <img
            src={item.iconLink}
            alt={item.itemName}
            className="h-9 w-9 object-contain"
          />
        ) : (
          <Package className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* アイテム名 + FIR バッジ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm ${
              isComplete ? "line-through text-muted-foreground" : ""
            }`}
          >
            {item.itemName}
          </span>
          {item.isFIR && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              FIR
            </Badge>
          )}
        </div>
      </div>

      {/* 所持数 / 必要数 */}
      <span
        className={`text-sm tabular-nums shrink-0 w-20 text-right ${
          isComplete ? "text-green-500 font-medium" : "text-muted-foreground"
        }`}
      >
        {count} / {item.totalNeeded}
      </span>

      {/* カウンター */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCountChange(Math.max(0, count - 1))}
          disabled={count <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={count}
          onChange={(e) =>
            onCountChange(Math.max(0, parseInt(e.target.value) || 0))
          }
          className="h-7 w-14 text-center text-sm px-1"
          min={0}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCountChange(count + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// メインページ
// ──────────────────────────────────────────────
export default function HideoutPage() {
  const { progress, setHideoutItemCount } = useProgress();
  const [pageView, setPageView] = useState<PageView>("stations");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [itemsFilter, setItemsFilter] = useState<ItemsFilter>("incomplete");

  // ──── ステーションビュー用 ────
  const filteredStations = useMemo(() => {
    if (statusFilter === "all") return stations;
    return stations.filter((station) =>
      station.levels.some((level) => {
        const isCompleted =
          progress.hideout[station.id]?.[level.level]?.completed ?? false;
        return statusFilter === "completed" ? isCompleted : !isCompleted;
      })
    );
  }, [statusFilter, progress]);

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const station of stations) {
      for (const level of station.levels) {
        total++;
        if (progress.hideout[station.id]?.[level.level]?.completed) completed++;
      }
    }
    return { total, completed };
  }, [progress]);

  // ──── 必要アイテムビュー用 ────
  // 未完了レベルのアイテムを集約（FIR別・アイテム別に合算）
  const aggregatedItems = useMemo(() => {
    const itemMap = new Map<string, AggregatedItem>();

    stations.forEach((station) => {
      station.levels.forEach((level) => {
        const isLevelCompleted =
          progress.hideout[station.id]?.[level.level]?.completed ?? false;
        if (isLevelCompleted) return;

        level.itemRequirements.forEach((req) => {
          const fir = isFIRRequired(req.attributes);
          const key = `${req.item.id}-${fir ? "fir" : "nofir"}`;

          if (itemMap.has(key)) {
            itemMap.get(key)!.totalNeeded += req.count;
          } else {
            itemMap.set(key, {
              key,
              itemId: req.item.id,
              itemName: req.item.name,
              iconLink: req.item.iconLink ?? "",
              isFIR: fir,
              totalNeeded: req.count,
            });
          }
        });
      });
    });

    return Array.from(itemMap.values()).sort((a, b) =>
      a.itemName.localeCompare(b.itemName, "ja")
    );
  }, [progress]);

  const displayedItems = useMemo(() => {
    if (itemsFilter === "all") return aggregatedItems;
    return aggregatedItems.filter((item) => {
      const count = progress.hideoutItems?.[item.key] ?? 0;
      return count < item.totalNeeded;
    });
  }, [aggregatedItems, itemsFilter, progress]);

  const itemStats = useMemo(() => {
    const total = aggregatedItems.length;
    const collected = aggregatedItems.filter((item) => {
      const count = progress.hideoutItems?.[item.key] ?? 0;
      return count >= item.totalNeeded;
    }).length;
    return { total, collected };
  }, [aggregatedItems, progress]);

  const resetItemCounts = () => {
    aggregatedItems.forEach((item) => {
      setHideoutItemCount(item.key, 0);
    });
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hideout</h1>
        {pageView === "stations" ? (
          <span className="text-sm text-muted-foreground">
            {stats.completed} / {stats.total} levels completed
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {itemStats.collected} / {itemStats.total} 種類収集済み
          </span>
        )}
      </div>

      {/* ビュー切替 */}
      <div className="flex gap-2">
        <Button
          variant={pageView === "stations" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => setPageView("stations")}
        >
          <List className="h-4 w-4" />
          ステーション
        </Button>
        <Button
          variant={pageView === "items" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => setPageView("items")}
        >
          <Package className="h-4 w-4" />
          必要アイテム
        </Button>
      </div>

      {/* ──── ステーションビュー ──── */}
      {pageView === "stations" && (
        <>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ステーション</SelectItem>
              <SelectItem value="completed">完了済み</SelectItem>
              <SelectItem value="incomplete">未完了</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredStations.map((station) => {
              const completedCount = station.levels.filter(
                (l) => progress.hideout[station.id]?.[l.level]?.completed
              ).length;

              return (
                <Card key={station.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{station.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {completedCount}/{station.levels.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {station.levels.length === 1 ? (
                      <LevelDetail
                        station={station}
                        level={station.levels[0]}
                      />
                    ) : (
                      <Tabs
                        defaultValue={String(station.levels[0]?.level ?? 1)}
                      >
                        <TabsList className="w-full">
                          {station.levels.map((level) => {
                            const isCompleted =
                              progress.hideout[station.id]?.[level.level]
                                ?.completed ?? false;
                            return (
                              <TabsTrigger
                                key={level.level}
                                value={String(level.level)}
                                className={`flex-1 text-xs ${
                                  isCompleted
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                Lv.{level.level}
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>
                        {station.levels.map((level) => (
                          <TabsContent
                            key={level.level}
                            value={String(level.level)}
                            className="mt-3"
                          >
                            <LevelDetail station={station} level={level} />
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ──── 必要アイテムビュー ──── */}
      {pageView === "items" && (
        <div className="space-y-3">
          {/* フィルター + リセット */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={itemsFilter}
              onValueChange={(v) => setItemsFilter(v as ItemsFilter)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incomplete">未収集のみ</SelectItem>
                <SelectItem value="all">全アイテム</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={resetItemCounts}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              カウントをリセット
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            未完了のハイドアウトレベルに必要なアイテムの一覧です。同じアイテムでも FIR（レイド中に発見）が必要なものと不要なものは別々に表示されます。
          </p>

          {/* アイテムリスト */}
          {displayedItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {itemsFilter === "incomplete"
                ? "未収集のアイテムはありません。"
                : "必要なアイテムがありません。"}
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayedItems.map((item) => (
                <ItemCountRow
                  key={item.key}
                  item={item}
                  count={progress.hideoutItems?.[item.key] ?? 0}
                  onCountChange={(count) =>
                    setHideoutItemCount(item.key, count)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
