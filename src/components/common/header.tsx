"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchDialog } from "./search-dialog";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b border-border px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono">
            Ctrl+K
          </kbd>
        </Button>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
