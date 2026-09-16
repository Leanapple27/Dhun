import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import BottomPlayer from "../components/layout/BottomPlayer";
import MobileNav from "../components/layout/MobileNav";
import QueuePanel from "../components/player/QueuePanel";
import AudioEngine from "../components/player/AudioEngine";
import ClientThemeProvider from "./ClientThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dhun — Music Player",
  description: "A beautiful, modern web music player",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} h-screen flex flex-col overflow-hidden`}>
        <ClientThemeProvider>
          <div className="flex flex-1 overflow-hidden h-full">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 bg-background relative h-full">
              <TopBar />
              <div className="flex-1 overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {children}
              </div>
            </main>
            <QueuePanel />
          </div>
          <BottomPlayer />
          <MobileNav />
          <AudioEngine />
        </ClientThemeProvider>
      </body>
    </html>
  );
}
