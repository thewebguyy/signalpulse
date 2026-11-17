"use client";

import Link from "next/link";
import { OfficialShieldIcon, LockClosedIcon } from "@/components/icons";
import { useLocalIncidents } from "@/components/local-store";

export function AppHeader() {
  const incidents = useLocalIncidents();
  const count = incidents.length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded bg-[#064E3B] font-bold text-white text-xs sm:text-sm tracking-tight">
            SP
          </span>
          <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base">
            SignalPulse <span className="text-[#064E3B]">NG</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/incidents"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 border border-slate-200 hover:bg-slate-200/70 transition-colors"
          >
            <LockClosedIcon className="h-3.5 w-3.5 text-[#064E3B]" aria-hidden="true" />
            <span>
              {count > 0 ? `${count} saved on this device` : "Saved on this device"}
            </span>
          </Link>

          <Link
            href="/guidance"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors"
          >
            <OfficialShieldIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>Get help</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
