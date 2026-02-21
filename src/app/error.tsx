"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message || "An unexpected error occurred."}
            </p>
          </div>
          <Button onClick={reset}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
