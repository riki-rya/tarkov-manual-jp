"use client";

import type { HideoutStation, HideoutLevel } from "@/types/tarkov";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Wrench,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import { useProgress } from "@/lib/storage/progress-context";
import Image from "next/image";

function formatTime(seconds: number): string {
  if (seconds === 0) return "即時";
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

interface LevelDetailProps {
  station: HideoutStation;
  level: HideoutLevel;
}

export function LevelDetail({ station, level }: LevelDetailProps) {
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
              完了
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
            必要アイテム
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
                    <Image
                      src={req.item.iconLink}
                      alt={req.item.name}
                      width={32}
                      height={32}
                      className="object-contain"
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
            ステーション要件
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
            スキル要件
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
            トレーダー要件
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
