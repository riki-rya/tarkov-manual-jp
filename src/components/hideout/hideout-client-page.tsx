"use client";

import { useState, useMemo } from "react";
import type { HideoutStation } from "@/types/tarkov";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Package, RotateCcw } from "lucide-react";
import { useProgress } from "@/lib/storage/progress-context";
import { LevelDetail } from "@/components/hideout/level-detail";
import { ItemCountRow, type AggregatedItem } from "@/components/hideout/item-count-row";

type StatusFilter = "all" | "completed" | "incomplete";
type PageView = "stations" | "items";
type ItemsFilter = "incomplete" | "all";

function isFIRRequired(attributes?: { name: string; value: string }[]): boolean {
  return (
    attributes?.some(
      (a) => a.name === "foundInRaid" && (a.value === "true" || a.value === "1")
    ) ?? false
  );
}

interface HideoutClientPageProps {
  stations: HideoutStation[];
}

export function HideoutClientPage({ stations }: HideoutClientPageProps) {
  const { progress, setHideoutItemCount } = useProgress();
  const [pageView, setPageView] = useState<PageView>("stations");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [itemsFilter, setItemsFilter] = useState<ItemsFilter>("incomplete");

  const filteredStations = useMemo(() => {
    if (statusFilter === "all") return stations;
    return stations.filter((station) =>
      station.levels.some((level) => {
        const isCompleted =
          progress.hideout[station.id]?.[level.level]?.completed ?? false;
        return statusFilter === "completed" ? isCompleted : !isCompleted;
      })
    );
  }, [statusFilter, progress, stations]);

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
  }, [progress, stations]);

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
  }, [progress, stations]);

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
    aggregatedItems.forEach((item) => setHideoutItemCount(item.key, 0));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ハイドアウト</h1>
        {pageView === "stations" ? (
          <span className="text-sm text-muted-foreground">
            {stats.completed} / {stats.total} レベル完了
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {itemStats.collected} / {itemStats.total} 種類収集済み
          </span>
        )}
      </div>

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

      {pageView === "stations" && (
        <>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="フィルター" />
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
                      <LevelDetail station={station} level={station.levels[0]} />
                    ) : (
                      <Tabs defaultValue={String(station.levels[0]?.level ?? 1)}>
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

      {pageView === "items" && (
        <div className="space-y-3">
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
                  onCountChange={(count) => setHideoutItemCount(item.key, count)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
