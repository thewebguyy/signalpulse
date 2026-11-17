"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SignalWaveIcon,
  DocketPenIcon,
  PaperclipIcon,
  ChartBarIcon,
  OfficialShieldIcon,
  LockClosedIcon,
} from "@/components/icons";

interface NavItem {
  href: string;
  label: string;
  mobileLabel: string;
  icon: typeof HomeIcon;
  description: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Overview", mobileLabel: "Home", icon: HomeIcon, description: "Platform purpose & actions" },
  { href: "/check", label: "Network Check", mobileLabel: "Check", icon: SignalWaveIcon, description: "Controlled latency & download" },
  { href: "/incidents", label: "Incident Journal", mobileLabel: "Journal", icon: DocketPenIcon, description: "Log dropped calls & failures" },
  { href: "/evidence", label: "Evidence Builder", mobileLabel: "Evidence", icon: PaperclipIcon, description: "Compile private dispute dossier" },
  { href: "/intelligence", label: "Network Intelligence", mobileLabel: "Area Data", icon: ChartBarIcon, description: "Lagos aggregated metrics" },
  { href: "/guidance", label: "NCC Consumer Rights", mobileLabel: "NCC Guide", icon: OfficialShieldIcon, description: "Official escalation procedures" },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Left Rail Navigation (>= 1024px) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between shrink-0 border-r border-slate-200 bg-white p-5 min-h-[calc(100vh-61px)]">
        <div className="space-y-6">
          <nav aria-label="Main Navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 mt-0.5 transition-colors ${
                      isActive ? "text-[#064E3B]" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm leading-tight">{item.label}</span>
                    <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Privacy Note */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <LockClosedIcon className="h-3.5 w-3.5 text-[#064E3B]" aria-hidden="true" />
              <span>Offline-First Ledger</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              All incident drafts and test logs stay in your browser until you choose to download or submit them.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-700">SignalPulse NG</p>
          <p>Lagos State Consumer Evidence Platform</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (< 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-1 lg:hidden pb-[env(safe-area-inset-bottom)]"
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center py-1 transition-colors ${
                isActive ? "text-[#064E3B] font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-[#064E3B]" : "text-slate-400"}`}
                  aria-hidden="true"
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-[#064E3B]" />
                )}
              </div>
              <span className="mt-1 text-[10px] sm:text-[11px] font-medium leading-none tracking-tight truncate max-w-full px-0.5">
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
