import Link from "next/link";
import { OfficialShieldIcon, LockClosedIcon } from "@/components/icons";

interface AppHeaderProps {
  localDraftCount?: number;
}

export function AppHeader({ localDraftCount = 0 }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E2DC] bg-[#FFFFFF]/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 text-decoration-none group shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#0C4A3E] font-bold text-white text-sm tracking-tight transition-transform group-hover:scale-105">
              SP
            </span>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[#121514] text-sm sm:text-base leading-tight">
                SignalPulse <span className="text-[#0C4A3E]">NG</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#64706C] tracking-wide truncate">
                Lagos Consumer Evidence
              </span>
            </div>
          </Link>
          <span className="hidden md:inline-flex items-center rounded-sm bg-[#F4F3F0] px-2 py-0.5 text-[11px] font-medium text-[#3F4946] border border-[#E5E2DC]">
            Lagos State v0.1
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#F4F3F0] px-2.5 py-1 text-xs text-[#3F4946] border border-[#E5E2DC]"
            role="status"
            aria-live="polite"
          >
            <LockClosedIcon className="h-3.5 w-3.5 text-[#0C4A3E]" aria-hidden="true" />
            <span className="hidden md:inline font-medium">Local Device:</span>
            <span className="font-semibold text-[#121514]">
              {localDraftCount > 0 ? `${localDraftCount} Drafts` : "Private Mode"}
            </span>
          </div>

          <Link
            href="/guidance"
            className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#065F46] hover:bg-[#D1FAE5] transition-colors"
            title="NCC Consumer Escalation Guidance"
          >
            <OfficialShieldIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>NCC Rights</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
