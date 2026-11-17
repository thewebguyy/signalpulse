import Link from "next/link";
import { OfficialShieldIcon, LockClosedIcon } from "@/components/icons";

interface AppHeaderProps {
  localDraftCount?: number;
}

export function AppHeader({ localDraftCount = 0 }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5">
        {/* Brand Anchor */}
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none group">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded bg-[#064E3B] font-bold text-white text-xs sm:text-sm tracking-tight transition-transform group-hover:scale-105">
            SP
          </span>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base leading-none">
              SignalPulse <span className="text-[#064E3B]">NG</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-normal mt-0.5">
              Consumer Connectivity Intelligence · Lagos
            </span>
          </div>
        </Link>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 border border-slate-200"
            role="status"
          >
            <LockClosedIcon className="h-3.5 w-3.5 text-[#064E3B]" aria-hidden="true" />
            <span>
              {localDraftCount > 0 ? `${localDraftCount} saved locally` : "Private local ledger"}
            </span>
          </div>

          <Link
            href="/guidance"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors"
            title="Official Nigerian Communications Commission Consumer Guidance"
          >
            <OfficialShieldIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>NCC Rights</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
