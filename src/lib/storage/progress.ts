import type { ProgressData } from "@/types/tarkov";

const STORAGE_KEY = "eft-tracker-progress";
const CURRENT_VERSION = "1.0.0";

function createDefaultProgress(): ProgressData {
  return {
    version: CURRENT_VERSION,
    lastUpdated: new Date().toISOString(),
    tasks: {},
    hideout: {},
    hideoutItems: {},
    stats: {
      totalPlayTime: 0,
      tasksCompleted: 0,
      hideoutCompletionPercent: 0,
    },
  };
}

export function getProgress(): ProgressData {
  if (typeof window === "undefined") return createDefaultProgress();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultProgress();
    const parsed = JSON.parse(stored) as ProgressData;
    // マイグレーション: hideoutItems が存在しない場合は追加
    if (!parsed.hideoutItems) parsed.hideoutItems = {};
    return parsed;
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;

  const toSave = { ...data, lastUpdated: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function calculateStats(progress: ProgressData): void {
  let tasksCompleted = 0;
  for (const taskId of Object.keys(progress.tasks)) {
    if (progress.tasks[taskId].completed) {
      tasksCompleted++;
    }
  }
  progress.stats.tasksCompleted = tasksCompleted;
}
