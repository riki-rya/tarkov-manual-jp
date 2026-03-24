"use client";

import { useMemo } from "react";
import type { Task, HideoutStation } from "@/types/tarkov";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/storage/progress-context";
import { ListChecks, Building2, Trophy, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const CHART_COLORS = ["#d4a574", "#3a3a3a"];

interface DashboardClientPageProps {
  tasks: Task[];
  stations: HideoutStation[];
}

export function DashboardClientPage({ tasks, stations }: DashboardClientPageProps) {
  const { progress } = useProgress();

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = Object.values(progress.tasks).filter(
      (t) => t.completed
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const traderMap = new Map<string, { total: number; completed: number }>();
    for (const task of tasks) {
      const name = task.trader.name;
      if (!traderMap.has(name)) traderMap.set(name, { total: 0, completed: 0 });
      const s = traderMap.get(name)!;
      s.total++;
      if (progress.tasks[task.id]?.completed) s.completed++;
    }
    const traderStats = Array.from(traderMap.entries())
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.total - a.total);

    return { total, completed, percent, traderStats };
  }, [tasks, progress]);

  const hideoutStats = useMemo(() => {
    let totalLevels = 0;
    let completedLevels = 0;
    for (const station of stations) {
      for (const level of station.levels) {
        totalLevels++;
        if (progress.hideout[station.id]?.[level.level]?.completed) {
          completedLevels++;
        }
      }
    }
    const percent =
      totalLevels > 0
        ? Math.round((completedLevels / totalLevels) * 100)
        : 0;
    return { totalLevels, completedLevels, percent };
  }, [stations, progress]);

  const recentTasks = useMemo(() => {
    return Object.entries(progress.tasks)
      .filter(([, t]) => t.completed && t.completedAt)
      .sort((a, b) => (b[1].completedAt! > a[1].completedAt! ? 1 : -1))
      .slice(0, 5)
      .map(([id]) => tasks.find((t) => t.id === id))
      .filter(Boolean) as Task[];
  }, [tasks, progress]);

  const pieData = [
    { name: "完了", value: taskStats.completed },
    { name: "未完了", value: taskStats.total - taskStats.completed },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              タスク完了数
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskStats.completed}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}/ {taskStats.total}
              </span>
            </div>
            <Progress value={taskStats.percent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ハイドアウト進捗
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hideoutStats.completedLevels}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}/ {hideoutStats.totalLevels}
              </span>
            </div>
            <Progress value={hideoutStats.percent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              タスク達成率
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.percent}%</div>
            <p className="text-xs text-muted-foreground mt-1">全体の進捗</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ハイドアウト達成率
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hideoutStats.percent}%</div>
            <p className="text-xs text-muted-foreground mt-1">全体の進捗</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">タスク進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded" style={{ background: CHART_COLORS[0] }} />
                完了 ({taskStats.completed})
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded" style={{ background: CHART_COLORS[1] }} />
                未完了 ({taskStats.total - taskStats.completed})
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">トレーダー別進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskStats.traderStats}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "#a0a0a0", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#2a2a2a",
                      border: "1px solid #3a3a3a",
                      borderRadius: "8px",
                      color: "#e0e0e0",
                    }}
                  />
                  <Bar dataKey="completed" fill="#d4a574" radius={[0, 4, 4, 0]} name="完了" />
                  <Bar dataKey="total" fill="#3a3a3a" radius={[0, 4, 4, 0]} name="合計" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近完了したタスク</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだタスクが完了していません。タスクページから始めましょう！
            </p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{task.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.trader.name}
                    </p>
                  </div>
                  <Badge variant="secondary">+{task.experience} XP</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
