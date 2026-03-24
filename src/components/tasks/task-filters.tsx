import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import type { SortField, CompletionFilter } from "@/hooks/use-task-filters";

interface TaskFiltersProps {
  uniqueTraders: string[];
  uniqueMaps: string[];
  search: string;
  traderFilter: string;
  mapFilter: string;
  completionFilter: CompletionFilter;
  kappaOnly: boolean;
  lightkeeperOnly: boolean;
  sortField: SortField;
  onSearchChange: (value: string) => void;
  onTraderChange: (value: string) => void;
  onMapChange: (value: string) => void;
  onCompletionChange: (value: CompletionFilter) => void;
  onKappaChange: (checked: boolean) => void;
  onLightkeeperChange: (checked: boolean) => void;
  onSortToggle: (field: SortField) => void;
}

export function TaskFilters({
  uniqueTraders,
  uniqueMaps,
  search,
  traderFilter,
  mapFilter,
  completionFilter,
  kappaOnly,
  lightkeeperOnly,
  sortField,
  onSearchChange,
  onTraderChange,
  onMapChange,
  onCompletionChange,
  onKappaChange,
  onLightkeeperChange,
  onSortToggle,
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="タスク名・トレーダー名・目標で検索..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={traderFilter} onValueChange={onTraderChange}>
          <SelectTrigger>
            <SelectValue placeholder="トレーダー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全トレーダー</SelectItem>
            {uniqueTraders.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mapFilter} onValueChange={onMapChange}>
          <SelectTrigger>
            <SelectValue placeholder="マップ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全マップ</SelectItem>
            {uniqueMaps.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={completionFilter}
          onValueChange={(v) => onCompletionChange(v as CompletionFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            <SelectItem value="completed">完了済み</SelectItem>
            <SelectItem value="incomplete">未完了</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={kappaOnly}
              onCheckedChange={(c) => onKappaChange(c === true)}
            />
            KAPPA
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={lightkeeperOnly}
              onCheckedChange={(c) => onLightkeeperChange(c === true)}
            />
            LK
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        {(
          [
            ["name", "名前"],
            ["level", "レベル"],
            ["experience", "XP"],
          ] as [SortField, string][]
        ).map(([field, label]) => (
          <Button
            key={field}
            variant={sortField === field ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSortToggle(field)}
          >
            {label}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ))}
      </div>
    </div>
  );
}
