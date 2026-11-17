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
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", mobileLabel: "Home", icon: HomeIcon },
  { href: "/check", label: "Network Check", mobileLabel: "Check", icon: SignalWaveIcon },
  { href: "/incidents", label: "My Reports", mobileLabel: "Reports", icon: DocketPenIcon },
  { href: "/evidence", label: "Evidence", mobileLabel: "Evidence", icon: PaperclipIcon },
  { href: "/intelligence", label: "Network Insights", mobileLabel: "Insights", icon: ChartBarIcon },
  { href: "/guidance", label: "Get Help", mobileLabel: "Help", icon: OfficialShieldIcon },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Left Rail Navigation (>= 1024px) */}
      <aside className="hidden lg:flex w-60 flex-col justify-between shrink-0 border-r border-slate-200 bg-white p-4 min-h-[calc(100vh-57px)]">
        <nav aria-label="Main Navigation" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-50/80 text-[#064E3B] font-semibold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-[#064E3B]" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <LockClosedIcon className="h-3.5 w-3.5 text-[#064E3B]" aria-hidden="true" />
            <span>Private on this device</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Your reports stay on this phone or computer unless you download or print them.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (< 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-1 lg:hidden pb-[env(safe-area-inset-bottom)]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center py-1 transition-colors ${isActive ? "text-[#064E3B] font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-[#064E3B]" : "text-slate-400"}`}
                aria-hidden="true"
              />
              <span className="mt-1 text-[10px] font-medium leading-none tracking-tight truncate max-w-full px-0.5">
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
