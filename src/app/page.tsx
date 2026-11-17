import Link from "next/link";
import { HomeRecordsSummary } from "@/components/home-summary";
import { ArrowRightIcon } from "@/components/icons";

export default function HomePage() {
  return (
    <main id="main" className="mx-auto max-w-4xl space-y-10 px-4 sm:px-6 py-8 sm:py-14">
      {/* Hero */}
      <section aria-labelledby="hero-title" className="space-y-6">
        <div className="space-y-4 max-w-2xl">
          <h1
            id="hero-title"
            className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]"
          >
            Bad network? Keep a record.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-slate-600">
            Dropped calls, missing airtime or data that won&apos;t work? Record what happened, keep your evidence together, and know what to do next.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/incidents"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-[#064E3B] px-5 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#022C22] transition-colors"
          >
            <span>Report a problem</span>
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/evidence"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm sm:text-base font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            View my records
          </Link>
        </div>
      </section>

      {/* Local State Utility Summary */}
      <HomeRecordsSummary />

      {/* Honest Testing Availability */}
      <section
        aria-label="Connection testing status"
        className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-amber-950">
            Connection testing isn&apos;t available yet
          </h2>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            You can still log dropped calls, data issues, or billing problems and prepare your complaint.
          </p>
        </div>
        <Link
          href="/check"
          className="text-xs sm:text-sm font-semibold text-amber-950 underline underline-offset-4 hover:text-amber-800 shrink-0"
        >
          See what&apos;s coming
        </Link>
      </section>

      {/* Simple 3-Step Consumer Flow */}
      <section aria-labelledby="steps-title" className="space-y-4 pt-2">
        <h2 id="steps-title" className="text-lg font-bold text-slate-900">
          How it helps
        </h2>

        <ol className="grid gap-6 sm:grid-cols-3">
          <li className="space-y-1.5 border-t-2 border-[#064E3B] pt-3">
            <span className="text-xs font-semibold text-[#064E3B]">1. Record what happened</span>
            <p className="text-sm text-slate-600 leading-relaxed">
              Save the network, Lagos area, time, and what went wrong while the details are fresh.
            </p>
          </li>

          <li className="space-y-1.5 border-t-2 border-slate-300 pt-3">
            <span className="text-xs font-semibold text-slate-700">2. Contact your network</span>
            <p className="text-sm text-slate-600 leading-relaxed">
              Report the issue to MTN, Airtel, Glo, or T2mobile first and add your ticket number to your record.
            </p>
          </li>

          <li className="space-y-1.5 border-t-2 border-slate-300 pt-3">
            <span className="text-xs font-semibold text-slate-700">3. Prepare your complaint</span>
            <p className="text-sm text-slate-600 leading-relaxed">
              Download or print your summary so you&apos;re ready if you need to escalate to the NCC.
            </p>
          </li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-800">SignalPulse NG</span> — Lagos State
        </div>
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-4">
          <Link href="/check" className="hover:text-slate-900">Network Check</Link>
          <Link href="/incidents" className="hover:text-slate-900">My Reports</Link>
          <Link href="/evidence" className="hover:text-slate-900">Evidence</Link>
          <Link href="/intelligence" className="hover:text-slate-900">Network Insights</Link>
          <Link href="/guidance" className="hover:text-slate-900">Get Help</Link>
        </nav>
      </footer>
    </main>
  );
}
