import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { AppNavigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "SignalPulse NG | Independent Network Intelligence & Consumer Evidence",
  description: "Lagos State consumer-evidence platform. Measure connectivity, document service incidents, assemble private evidence, and take informed action.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG" className="overflow-x-hidden">
      <body className="min-h-screen bg-[#FBFBFA] text-[#121514] antialiased overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#0C4A3E] focus:p-3 focus:text-white focus:font-semibold"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <AppHeader />
          <div className="flex flex-1 overflow-x-hidden">
            <AppNavigation />
            <div className="flex-1 min-w-0 pb-20 lg:pb-12 overflow-x-hidden">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
