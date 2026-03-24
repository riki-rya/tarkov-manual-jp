import type { Task } from "@/types/tarkov";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  onOpenModal: () => void;
}

export function TaskCard({
  task,
  isCompleted,
  onToggle,
  onOpenModal,
}: TaskCardProps) {
  const visibleObjectives = task.objectives.filter((o) => !o.optional).slice(0, 3);
  const remainingCount =
    task.objectives.filter((o) => !o.optional).length - visibleObjectives.length;

  return (
    <Card className={`transition-colors ${isCompleted ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggle}
            className="mt-0.5 shrink-0"
          />

          <div
            className="flex-1 min-w-0 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={onOpenModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpenModal();
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-semibold text-sm ${
                  isCompleted ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.name}
              </span>
              {task.kappaRequired && (
                <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0">
                  Kappa
                </Badge>
              )}
              {task.lightkeeperRequired && (
                <Badge className="bg-yellow-500 text-black text-[10px] px-1.5 py-0">
                  LK
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                {task.trader.name}
              </Badge>
              {task.map && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                  {task.map.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                Lv.{task.minPlayerLevel}
              </Badge>
            </div>

            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">目標:</p>
              <ul className="space-y-0.5">
                {visibleObjectives.map((obj) => (
                  <li
                    key={obj.id}
                    className="text-xs text-muted-foreground flex items-start gap-1"
                  >
                    <span className="shrink-0 mt-px">•</span>
                    <span>{obj.description}</span>
                  </li>
                ))}
                {remainingCount > 0 && (
                  <li className="text-xs text-muted-foreground">
                    ...他{remainingCount}件
                  </li>
                )}
              </ul>
            </div>
          </div>

          <ChevronRight
            className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-pointer"
            onClick={onOpenModal}
          />
        </div>
      </CardContent>
    </Card>
  );
}
