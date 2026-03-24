import type { Task } from "@/types/tarkov";
import taskData from "../../../data/task.json";

export function getTasks(): Task[] {
  return taskData.tasks as Task[];
}

export function getUnlocksAfterMap(): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  getTasks().forEach((task) => {
    task.taskRequirements.forEach((req) => {
      const existing = map.get(req.task.id) ?? [];
      existing.push(task);
      map.set(req.task.id, existing);
    });
  });
  return map;
}

/** RSC 境界を越えて渡せるシリアライズ可能な形式 */
export function getUnlocksAfterRecord(): Record<string, Task[]> {
  return Object.fromEntries(getUnlocksAfterMap());
}

export function getUniqueTraders(): string[] {
  return Array.from(new Set(getTasks().map((t) => t.trader.name))).sort();
}

export function getUniqueMaps(): string[] {
  return Array.from(
    new Set(getTasks().filter((t) => t.map).map((t) => t.map!.name))
  ).sort();
}
