"use client";

import { useState, useRef } from "react";
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    resetAll();
    setResetDialogOpen(false);
    toast.success("全進捗をリセットしました。");
  };

  const handleExport = () => {
    const json = JSON.stringify(progress, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eft-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("進捗データをエクスポートしました。");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result as string);
        setImportDialogOpen(true);
        // Store the raw JSON temporarily in a data attribute for confirmation
        if (fileInputRef.current) {
          fileInputRef.current.dataset.pending = reader.result as string;
        }
      } catch {
        toast.error("無効なJSONファイルです。");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleImportConfirm = () => {
    const raw = fileInputRef.current?.dataset.pending;
    if (!raw) return;
    try {
      JSON.parse(raw); // validate JSON before saving
      localStorage.setItem("eft-tracker-progress", raw);
      // Reload the page to pick up the new data
      window.location.reload();
      toast.success("進捗データをインポートしました。");
    } catch {
      toast.error("インポートに失敗しました。");
    }
    setImportDialogOpen(false);
    if (fileInputRef.current) delete fileInputRef.current.dataset.pending;
  };

  const lastUpdated = progress.lastUpdated
    ? new Date(progress.lastUpdated).toLocaleString("ja-JP")
    : "未設定";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* Progress Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">進捗データ</CardTitle>
          <CardDescription>
            タスク・ハイドアウトの進捗データを管理します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">全進捗をリセット</p>
              <p className="text-xs text-muted-foreground">
                タスク・ハイドアウトの完了データをすべて削除します
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              リセット
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">進捗をエクスポート</p>
              <p className="text-xs text-muted-foreground">
                進捗データをJSONファイルとして保存します
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              エクスポート
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">進捗をインポート</p>
              <p className="text-xs text-muted-foreground">
                以前エクスポートしたJSONファイルを読み込みます
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              <Upload className="h-4 w-4 mr-1" />
              インポート
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ゲームデータ</CardTitle>
          <CardDescription>
            Tarkov.dev API からのゲームデータ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ゲームデータを更新</p>
              <p className="text-xs text-muted-foreground">
                `npm run fetch:all` を実行してAPIからデータを更新します
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-1" />
              更新
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            最終進捗更新: {lastUpdated}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">このアプリについて</CardTitle>
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
            <DialogTitle>全進捗をリセット</DialogTitle>
            <DialogDescription>
              本当に全進捗をリセットしますか？タスク・ハイドアウトの完了データがすべて削除されます。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              リセット
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>進捗をインポート</DialogTitle>
            <DialogDescription>
              現在の進捗データをインポートファイルで上書きします。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleImportConfirm}>
              インポート
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
