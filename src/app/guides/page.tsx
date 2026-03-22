import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function GuidesPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <Construction className="h-12 w-12 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold">近日公開予定</h1>
            <p className="text-sm text-muted-foreground mt-2">
              ガイドページは現在開発中です。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
