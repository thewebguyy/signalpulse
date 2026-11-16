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
  badge?: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Overview", mobileLabel: "Home", icon: HomeIcon },
  { href: "/check", label: "Network Check", mobileLabel: "Check", icon: SignalWaveIcon },
  { href: "/incidents", label: "Incident Journal", mobileLabel: "Journal", icon: DocketPenIcon },
  { href: "/evidence", label: "Evidence Builder", mobileLabel: "Evidence", icon: PaperclipIcon },
  { href: "/intelligence", label: "Network Intelligence", mobileLabel: "Area Data", icon: ChartBarIcon },
  { href: "/guidance", label: "NCC Consumer Guidance", mobileLabel: "NCC Guide", icon: OfficialShieldIcon },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Left Rail Navigation (>= 1024px) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between shrink-0 border-r border-[#E5E2DC] bg-[#FFFFFF] p-4 min-h-[calc(100vh-61px)]">
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#64706C]">
              Platform Navigation
            </p>
            <nav aria-label="Desktop Navigation" className="mt-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#E8F2EF] text-[#0C4A3E] font-semibold border-l-3 border-[#0C4A3E]"
                        : "text-[#3F4946] hover:bg-[#F4F3F0] hover:text-[#121514]"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#0C4A3E]" : "text-[#64706C]"}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-lg border border-[#E5E2DC] bg-[#FBFBFA] p-3 text-xs leading-relaxed text-[#3F4946]">
            <div className="flex items-center gap-1.5 font-semibold text-[#121514] mb-1">
              <LockClosedIcon className="h-4 w-4 text-[#0C4A3E]" aria-hidden="true" />
              <span>Evidence Ledger Mode</span>
            </div>
            <p className="text-[12px] text-[#64706C]">
              No data leaves this browser. All incident records and measurements remain in local storage until explicitly exported.
            </p>
          </div>
        </div>

        <div className="border-t border-[#E5E2DC] pt-3 text-[11px] text-[#64706C]">
          <p className="font-semibold text-[#121514]">SignalPulse NG</p>
          <p>CTO003-C Engineering Phase</p>
          <p className="mt-1">Wire v0.1 · Synthetic Mode</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#E5E2DC] bg-[#FFFFFF] px-1 lg:hidden pb-[env(safe-area-inset-bottom)]"
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center py-1 transition-colors ${
                isActive ? "text-[#0C4A3E] font-bold" : "text-[#64706C] hover:text-[#121514]"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-[#0C4A3E]" : "text-[#64706C]"}`} aria-hidden="true" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-[#0C4A3E]" />
                )}
              </div>
              <span className="mt-1 text-[11px] font-medium leading-none tracking-tight">
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
