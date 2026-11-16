import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalPulse NG | Local foundation",
  description: "Local engineering foundation for SignalPulse NG. Synthetic data only.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:p-3">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
