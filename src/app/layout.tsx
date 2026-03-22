import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Header } from "@/components/common/header";
import { ProgressProvider } from "@/lib/storage/progress-context";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "たるこふまにゅある",
  description:
    "Escape from Tarkov のタスク・ハイドアウト進捗を管理する日本語ツールです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ProgressProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <main className="flex-1 overflow-auto p-4 md:p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ProgressProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
