import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Header } from "@/components/common/header";
import { ProgressProvider } from "@/lib/storage/progress-context";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
