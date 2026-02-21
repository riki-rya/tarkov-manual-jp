"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "@/lib/storage/progress-context";
import { toast } from "sonner";
import {
  Trash2,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const { progress, resetAll } = useProgress();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleReset = () => {
    resetAll();
    setResetDialogOpen(false);
    toast.success("All progress has been reset.");
  };

  const lastUpdated = progress.lastUpdated
    ? new Date(progress.lastUpdated).toLocaleString("ja-JP")
    : "Never";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Progress Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress Data</CardTitle>
          <CardDescription>
            Manage your task and hideout progress data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset All Progress</p>
              <p className="text-xs text-muted-foreground">
                Clear all task and hideout completion data
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export Progress</p>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Import Progress</p>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription>
            Game data from Tarkov.dev API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Update Game Data</p>
              <p className="text-xs text-muted-foreground">
                Run `npm run fetch:all` to update data from the API
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-1" />
              Update
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Last progress update: {lastUpdated}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            たるこふまにゅある v0.1.0 - Escape from Tarkov 日本語進捗管理ツール
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Game data provided by{" "}
            <a
              href="https://tarkov.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              tarkov.dev
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Progress</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all progress? This will clear all task and hideout completion data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
