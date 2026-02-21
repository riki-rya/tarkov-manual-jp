import type { ProgressData, TaskProgress } from "@/types/tarkov";

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

  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getTaskProgress(
  taskId: string
): TaskProgress | undefined {
  const progress = getProgress();
  return progress.tasks[taskId];
}

export function completeTask(taskId: string): ProgressData {
  const progress = getProgress();
  if (!progress.tasks[taskId]) {
    progress.tasks[taskId] = {
      completed: false,
      objectives: {},
    };
  }
  progress.tasks[taskId].completed = true;
  progress.tasks[taskId].completedAt = new Date().toISOString();

  // Mark all objectives as completed too
  const task = progress.tasks[taskId];
  for (const objId of Object.keys(task.objectives)) {
    task.objectives[objId].completed = true;
  }

  calculateStats(progress);
  saveProgress(progress);
  return progress;
}

export function uncompleteTask(taskId: string): ProgressData {
  const progress = getProgress();
  if (progress.tasks[taskId]) {
    progress.tasks[taskId].completed = false;
    delete progress.tasks[taskId].completedAt;
  }
  calculateStats(progress);
  saveProgress(progress);
  return progress;
}

export function completeObjective(
  taskId: string,
  objectiveId: string
): ProgressData {
  const progress = getProgress();
  if (!progress.tasks[taskId]) {
    progress.tasks[taskId] = {
      completed: false,
      objectives: {},
    };
  }
  progress.tasks[taskId].objectives[objectiveId] = {
    completed: true,
  };
  saveProgress(progress);
  return progress;
}

export function uncompleteObjective(
  taskId: string,
  objectiveId: string
): ProgressData {
  const progress = getProgress();
  if (progress.tasks[taskId]?.objectives[objectiveId]) {
    progress.tasks[taskId].objectives[objectiveId].completed = false;
  }
  saveProgress(progress);
  return progress;
}

export function completeHideoutLevel(
  stationId: string,
  level: number
): ProgressData {
  const progress = getProgress();
  if (!progress.hideout[stationId]) {
    progress.hideout[stationId] = {};
  }
  progress.hideout[stationId][level] = {
    completed: true,
    completedAt: new Date().toISOString(),
  };
  calculateStats(progress);
  saveProgress(progress);
  return progress;
}

export function uncompleteHideoutLevel(
  stationId: string,
  level: number
): ProgressData {
  const progress = getProgress();
  if (progress.hideout[stationId]?.[level]) {
    progress.hideout[stationId][level].completed = false;
    delete progress.hideout[stationId][level].completedAt;
  }
  calculateStats(progress);
  saveProgress(progress);
  return progress;
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

export function isTaskCompleted(taskId: string): boolean {
  const progress = getProgress();
  return progress.tasks[taskId]?.completed ?? false;
}

export function isObjectiveCompleted(
  taskId: string,
  objectiveId: string
): boolean {
  const progress = getProgress();
  return progress.tasks[taskId]?.objectives[objectiveId]?.completed ?? false;
}

export function isHideoutLevelCompleted(
  stationId: string,
  level: number
): boolean {
  const progress = getProgress();
  return progress.hideout[stationId]?.[level]?.completed ?? false;
}
