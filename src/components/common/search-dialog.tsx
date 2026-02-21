"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ListChecks, Building2 } from "lucide-react";
import type { Task, HideoutStation } from "@/types/tarkov";
import taskData from "../../../data/task.json";
import hideoutData from "../../../data/hideout.json";

const tasks: Task[] = taskData.tasks as Task[];
const stations: HideoutStation[] =
  hideoutData.hideoutStations as HideoutStation[];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResult = {
  type: "task" | "hideout";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const r: SearchResult[] = [];

    // Search tasks
    for (const task of tasks) {
      if (
        task.name.toLowerCase().includes(q) ||
        task.trader.name.toLowerCase().includes(q)
      ) {
        r.push({
          type: "task",
          id: task.id,
          title: task.name,
          subtitle: `${task.trader.name} | Lv.${task.minPlayerLevel}`,
          href: "/tasks",
        });
      }
      if (r.length >= 20) break;
    }

    // Search hideout stations
    for (const station of stations) {
      if (station.name.toLowerCase().includes(q)) {
        r.push({
          type: "hideout",
          id: station.id,
          title: station.name,
          subtitle: `${station.levels.length} levels`,
          href: "/hideout",
        });
      }
    }

    return r.slice(0, 20);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, hideout stations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
        {results.length > 0 && (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted transition-colors"
                  onClick={() => handleSelect(result)}
                >
                  {result.type === "task" ? (
                    <ListChecks className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.subtitle}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {result.type}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
        {query.length >= 2 && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No results found.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
