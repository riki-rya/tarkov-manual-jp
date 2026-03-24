"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { ProgressData } from "@/types/tarkov";
import {
  getProgress,
  saveProgress,
  resetProgress as resetProgressStorage,
  calculateStats,
} from "./progress";

interface ProgressContextType {
  progress: ProgressData;
  toggleTask: (taskId: string) => void;
  toggleObjective: (taskId: string, objectiveId: string) => void;
  toggleHideoutLevel: (stationId: string, level: number) => void;
  setHideoutItemCount: (key: string, count: number) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>(() => getProgress());

  // SSR ハイドレーション後に localStorage の実データを読み込む
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(getProgress());
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setProgress((prev) => {
      const next = structuredClone(prev);
      if (!next.tasks[taskId]) {
        next.tasks[taskId] = { completed: false, objectives: {} };
      }
      const isCompleting = !next.tasks[taskId].completed;
      next.tasks[taskId].completed = isCompleting;
      if (isCompleting) {
        next.tasks[taskId].completedAt = new Date().toISOString();
        for (const objId of Object.keys(next.tasks[taskId].objectives)) {
          next.tasks[taskId].objectives[objId].completed = true;
        }
      } else {
        delete next.tasks[taskId].completedAt;
      }
      calculateStats(next);
      saveProgress(next);
      return next;
    });
  }, []);

  const toggleObjective = useCallback(
    (taskId: string, objectiveId: string) => {
      setProgress((prev) => {
        const next = structuredClone(prev);
        if (!next.tasks[taskId]) {
          next.tasks[taskId] = { completed: false, objectives: {} };
        }
        if (!next.tasks[taskId].objectives[objectiveId]) {
          next.tasks[taskId].objectives[objectiveId] = { completed: false };
        }
        next.tasks[taskId].objectives[objectiveId].completed =
          !next.tasks[taskId].objectives[objectiveId].completed;
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const toggleHideoutLevel = useCallback(
    (stationId: string, level: number) => {
      setProgress((prev) => {
        const next = structuredClone(prev);
        if (!next.hideout[stationId]) {
          next.hideout[stationId] = {};
        }
        if (!next.hideout[stationId][level]) {
          next.hideout[stationId][level] = { completed: false };
        }
        const isCompleting = !next.hideout[stationId][level].completed;
        next.hideout[stationId][level].completed = isCompleting;
        if (isCompleting) {
          next.hideout[stationId][level].completedAt =
            new Date().toISOString();
        } else {
          delete next.hideout[stationId][level].completedAt;
        }
        calculateStats(next);
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const setHideoutItemCount = useCallback((key: string, count: number) => {
    setProgress((prev) => {
      const next = structuredClone(prev);
      if (!next.hideoutItems) next.hideoutItems = {};
      next.hideoutItems[key] = Math.max(0, count);
      saveProgress(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    resetProgressStorage();
    setProgress(getProgress());
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, toggleTask, toggleObjective, toggleHideoutLevel, setHideoutItemCount, resetAll }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
