import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Minus } from "lucide-react";
import Image from "next/image";

export interface AggregatedItem {
  key: string;
  itemId: string;
  itemName: string;
  iconLink: string;
  isFIR: boolean;
  totalNeeded: number;
}

interface ItemCountRowProps {
  item: AggregatedItem;
  count: number;
  onCountChange: (count: number) => void;
}

export function ItemCountRow({ item, count, onCountChange }: ItemCountRowProps) {
  const isComplete = count >= item.totalNeeded;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
        isComplete ? "opacity-50 bg-muted/20" : "bg-card"
      }`}
    >
      <div className="h-9 w-9 shrink-0 flex items-center justify-center">
        {item.iconLink ? (
          <Image
            src={item.iconLink}
            alt={item.itemName}
            width={36}
            height={36}
            className="object-contain"
          />
        ) : (
          <Package className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

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

      <span
        className={`text-sm tabular-nums shrink-0 w-20 text-right ${
          isComplete ? "text-green-500 font-medium" : "text-muted-foreground"
        }`}
      >
        {count} / {item.totalNeeded}
      </span>

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
