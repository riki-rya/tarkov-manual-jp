import { describe, it, expect, beforeEach } from "vitest";
import {
  getProgress,
  saveProgress,
  resetProgress,
  calculateStats,
} from "../progress";
import type { ProgressData } from "@/types/tarkov";

const STORAGE_KEY = "eft-tracker-progress";

function makeProgress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    version: "1.0.0",
    lastUpdated: "2024-01-01T00:00:00.000Z",
    tasks: {},
    hideout: {},
    hideoutItems: {},
    stats: { totalPlayTime: 0, tasksCompleted: 0, hideoutCompletionPercent: 0 },
    ...overrides,
  };
}

describe("getProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorage が空の場合はデフォルト値を返す", () => {
    const result = getProgress();
    expect(result.version).toBe("1.0.0");
    expect(result.tasks).toEqual({});
    expect(result.hideout).toEqual({});
    expect(result.hideoutItems).toEqual({});
    expect(result.stats.tasksCompleted).toBe(0);
  });

  it("保存済みデータがある場合はそれを返す", () => {
    const stored = makeProgress({
      tasks: { "task-1": { completed: true, objectives: {} } },
      stats: { totalPlayTime: 0, tasksCompleted: 1, hideoutCompletionPercent: 0 },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const result = getProgress();
    expect(result.tasks["task-1"].completed).toBe(true);
    expect(result.stats.tasksCompleted).toBe(1);
  });

  it("hideoutItems が存在しない古いデータの場合は空オブジェクトで補完する", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacy: any = makeProgress();
    delete legacy.hideoutItems;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const result = getProgress();
    expect(result.hideoutItems).toEqual({});
  });

  it("不正な JSON の場合はデフォルト値を返す", () => {
    localStorage.setItem(STORAGE_KEY, "invalid-json{{");

    const result = getProgress();
    expect(result.tasks).toEqual({});
  });
});

describe("saveProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("データを localStorage に保存する", () => {
    const data = makeProgress({ tasks: { "task-1": { completed: true, objectives: {} } } });

    saveProgress(data);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.tasks["task-1"].completed).toBe(true);
  });

  it("引数オブジェクトを変更しない（ミューテーションなし）", () => {
    const data = makeProgress();
    const originalLastUpdated = data.lastUpdated;

    saveProgress(data);

    expect(data.lastUpdated).toBe(originalLastUpdated);
  });

  it("保存されるデータの lastUpdated を現在時刻で更新する", () => {
    const before = Date.now();
    const data = makeProgress();

    saveProgress(data);

    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(new Date(parsed.lastUpdated).getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("resetProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorage からデータを削除する", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeProgress()));

    resetProgress();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("削除後に getProgress を呼ぶとデフォルト値を返す", () => {
    const stored = makeProgress({
      tasks: { "task-1": { completed: true, objectives: {} } },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    resetProgress();

    expect(getProgress().tasks).toEqual({});
  });
});

describe("calculateStats", () => {
  it("完了済みタスク数を正しく計算する", () => {
    const progress = makeProgress({
      tasks: {
        "task-1": { completed: true, objectives: {} },
        "task-2": { completed: false, objectives: {} },
        "task-3": { completed: true, objectives: {} },
      },
    });

    calculateStats(progress);

    expect(progress.stats.tasksCompleted).toBe(2);
  });

  it("タスクがすべて未完了の場合は 0 を返す", () => {
    const progress = makeProgress({
      tasks: {
        "task-1": { completed: false, objectives: {} },
        "task-2": { completed: false, objectives: {} },
      },
      stats: { totalPlayTime: 0, tasksCompleted: 99, hideoutCompletionPercent: 0 },
    });

    calculateStats(progress);

    expect(progress.stats.tasksCompleted).toBe(0);
  });

  it("タスクが空の場合は 0 を返す", () => {
    const progress = makeProgress({
      stats: { totalPlayTime: 0, tasksCompleted: 5, hideoutCompletionPercent: 0 },
    });

    calculateStats(progress);

    expect(progress.stats.tasksCompleted).toBe(0);
  });

  it("すべてのタスクが完了の場合は全件数を返す", () => {
    const progress = makeProgress({
      tasks: {
        "task-1": { completed: true, objectives: {} },
        "task-2": { completed: true, objectives: {} },
        "task-3": { completed: true, objectives: {} },
      },
    });

    calculateStats(progress);

    expect(progress.stats.tasksCompleted).toBe(3);
  });
});
