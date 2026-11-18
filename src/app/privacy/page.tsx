import type { Metadata } from "next";
import Link from "next/link";
import { LockClosedIcon, OfficialShieldIcon, AlertCircleIcon, ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Privacy & Data Notice — SignalPulse NG",
  description:
    "How SignalPulse NG handles your reports: local-first browser storage, no cloud backup, shared-device considerations, and export rights.",
};

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-6 sm:py-10">
      <section aria-labelledby="privacy-title" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200">
          <LockClosedIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
          <span>Local-First Beta Architecture</span>
        </div>

        <h1
          id="privacy-title"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
        >
          Privacy &amp; Data Notice
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-slate-600">
          SignalPulse NG is designed around data minimization and subscriber privacy. Here is exactly how your data is handled in this public beta.
        </p>
      </section>

      {/* Core Privacy Facts */}
      <div className="space-y-4">
        {/* 1. On-Device Storage */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
            <span>1. Reports are saved in your current browser only</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All incident reports you enter are stored locally in your web browser&apos;s storage (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">localStorage</code>) on this specific phone or computer.
          </p>
        </div>

        {/* 2. No Account or Cloud Sync */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <OfficialShieldIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
            <span>2. No account or cloud backup</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            No signup, login, or password is required. In this beta release, cloud backup and synchronization are completely disabled. Your reports are not transmitted to or stored in any remote database.
          </p>
        </div>

        {/* 3. Clearing Data Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 text-amber-700" aria-hidden="true" />
            <span>3. Clearing browser data will erase your reports</span>
          </h2>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            Because records are kept solely in your browser, clearing your browsing history, clearing website data, or resetting your browser will permanently delete your stored reports. If you use Private or Incognito mode, reports will disappear as soon as you close the window.
          </p>
        </div>

        {/* 4. Shared Device Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 text-amber-700" aria-hidden="true" />
            <span>4. Shared and public device caution</span>
          </h2>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            Anyone who has access to this device and browser profile can see your saved reports. If you are using a shared phone, cybercafé terminal, or work computer, make sure to export your evidence and delete the saved reports before closing your session.
          </p>
        </div>

        {/* 5. You Control Your Evidence */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <OfficialShieldIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
            <span>5. You can export or delete your evidence anytime</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You own your data completely. You can download your reports as a standard JSON evidence file or generate a printable PDF summary at any time from the <Link href="/evidence" className="text-[#064E3B] font-semibold underline">Evidence</Link> page. You can also edit or permanently delete individual reports from <Link href="/incidents" className="text-[#064E3B] font-semibold underline">My Reports</Link>.
          </p>
        </div>

        {/* 6. Privacy-Safe Sharing */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LockClosedIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
            <span>6. Share cards exclude private narratives</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you generate a share card for social media (X or WhatsApp), only your selected network, broad problem category, and general Lagos LGA are shown. Your personal descriptions, phone numbers, and customer-care ticket numbers are strictly excluded from the card.
          </p>
        </div>

        {/* 7. Strict Independence */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <OfficialShieldIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
            <span>7. Independent platform</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SignalPulse NG is an independent community project and is not affiliated with, endorsed by, or operated by the Nigerian Communications Commission (NCC) or any telecommunications provider (MTN, Airtel, Globacom, or T2mobile).
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
        <Link
          href="/report"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
        >
          <span>Record a problem</span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href="/evidence"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          View my records
        </Link>
      </div>
    </main>
  );
}
