import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR_OPTIONS } from "@/components/constants";
import { ReportForm } from "@/components/report-form";
import { ArrowRightIcon, GitHubIcon, LockClosedIcon, OfficialShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Bad network? Keep a record — SignalPulse NG",
  description:
    "Calls dropping? Data not working? Airtime missing? Record what happened and keep the details together on MTN, Airtel, Glo, or T2mobile.",
};

export default function UniversalReportPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero */}
      <section aria-labelledby="report-hero-title" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200">
          <LockClosedIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
          <span>Independent & Private · Stored on your device</span>
        </div>

        <h1
          id="report-hero-title"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
        >
          Bad network? Keep a record.
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl">
          Calls dropping? Data not working? Airtime missing? Record what happened and keep the details together.
        </p>

        <div className="pt-1">
          <a
            href="#report-form"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-[#064E3B] px-6 py-3 text-base font-semibold text-white hover:bg-[#022C22] transition-colors shadow-sm"
          >
            <span>Report a problem</span>
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Network Quick Links (All 4 Nigerian Operators Clearly Shown) */}
      <section aria-labelledby="operators-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="operators-title" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select your mobile network
          </h2>
          <span className="text-xs text-slate-400">All major Nigerian networks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {OPERATOR_OPTIONS.map((op) => (
            <Link
              key={op.code}
              href={`/report/${op.code}`}
              className="flex min-h-[58px] flex-col justify-center rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: op.brandColor }}
                  aria-hidden="true"
                />
                <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-950 truncate">
                  {op.name.split(" ")[0]}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 truncate mt-0.5">
                {op.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Unified Reporting Component */}
      <ReportForm
        initialOperator="mtn"
        title="Report a problem"
        subtitle="Select your network, pick the problem, and save the report. Stored privately on your device."
        idPrefix="uni-rep"
      />

      {/* Open Source Contributor CTA */}
      <section
        aria-labelledby="contrib-title"
        className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
      >
        <div className="space-y-1">
          <h3 id="contrib-title" className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GitHubIcon className="h-4 w-4 text-slate-800" aria-hidden="true" />
            <span>Open source. Help us build it better.</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            SignalPulse NG is an independent, community-driven platform for Nigerian mobile subscribers. Inspect the code or contribute on GitHub.
          </p>
        </div>

        <a
          href="https://github.com/thewebguyy/signalpulse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-colors shrink-0"
        >
          <span>View on GitHub</span>
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>

      {/* NCC Escalation Reminder */}
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 flex items-start gap-3">
        <OfficialShieldIcon className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-xs text-emerald-950">
          <p className="font-semibold text-sm">
            What happens after you record an issue?
          </p>
          <p className="leading-relaxed">
            Report the problem to your network provider first and note your ticket reference. If unresolved after their official timeframe, you can escalate your structured evidence record to the Nigerian Communications Commission (NCC).
          </p>
          <Link
            href="/guidance"
            className="inline-block pt-1 font-semibold text-emerald-900 underline underline-offset-4 hover:text-emerald-700"
          >
            Read official consumer guidance & NCC escalation steps
          </Link>
        </div>
      </section>
    </main>
  );
}
