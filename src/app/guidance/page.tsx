import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import {
  OfficialShieldIcon,
  ArrowRightIcon,
} from "@/components/icons";

export default function GuidancePage() {
  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-100 text-emerald-900">
            <OfficialShieldIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            NCC Consumer Guidance
          </h1>
          <ProvenanceBadge provenance="official_source" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Official complaint escalation procedures and statutory consumer protection frameworks published by the Nigerian Communications Commission (NCC).
        </p>
      </div>

      {/* Independence & Non-Endorsement Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <OfficialShieldIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
          <span>Independent Platform Disclaimer</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          SignalPulse NG is an independent technology tool and is neither affiliated with nor endorsed by the Nigerian Communications Commission (NCC). The information below is summarized directly from public regulatory gazettes. Compensation decisions and enforcement actions rest solely with the Commission and licensed service providers.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span>Authority: Nigerian Communications Commission</span>
          <span>·</span>
          <span>Source: Consumer Code of Practice Regulations</span>
        </div>
      </div>

      {/* 4-Step Mandatory Consumer Pathway */}
      <section aria-labelledby="pathway-title" className="space-y-4">
        <div>
          <h2 id="pathway-title" className="text-lg font-bold text-slate-900">
            Mandatory Dispute Escalation Pathway
          </h2>
          <p className="text-xs text-slate-500">
            Follow these sequential steps to ensure your dispute meets regulatory escalation standards.
          </p>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                1. Lodge Complaint with Service Provider
              </span>
              <span className="text-xs font-semibold text-[#064E3B]">Mandatory First Step</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              The NCC requires that you first contact your mobile provider (MTN, Airtel, Glo, or T2mobile). Always obtain and record an official <strong>Ticket Reference ID</strong>. The NCC cannot intervene without this reference number.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                2. Allow Reasonable Operator Resolution Time
              </span>
              <span className="text-xs text-slate-500">Regulatory Grace Window</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Providers must be given statutory time to investigate:
            </p>
            <div className="grid gap-2 sm:grid-cols-3 pt-1 text-xs">
              <div className="rounded bg-slate-50 p-3 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">Outage / Data Stoppage:</span>
                <span className="text-slate-600">24 to 72 hours</span>
              </div>
              <div className="rounded bg-slate-50 p-3 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">Billing / Tariff Disputes:</span>
                <span className="text-slate-600">7 to 14 business days</span>
              </div>
              <div className="rounded bg-slate-50 p-3 border border-slate-200/80">
                <span className="font-bold text-slate-900 block">SIM Porting & VAS:</span>
                <span className="text-slate-600">Up to 48 hours</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                3. Escalate to the NCC Consumer Affairs Bureau
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                Official Channels
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              If your provider fails to resolve the issue within the prescribed period, or offers an unsatisfactory outcome, escalate to the Commission:
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Toll-Free Hotline</span>
                <span className="font-mono text-base font-bold text-[#064E3B] block">622</span>
                <span className="text-[11px] text-slate-500">Mon–Fri 8:00 AM – 5:00 PM</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Consumer Portal</span>
                <span className="font-mono text-xs font-semibold text-[#064E3B] block break-all">consumer.ncc.gov.ng</span>
                <span className="text-[11px] text-slate-500">Online dispute tracking</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Consumer Email</span>
                <span className="font-mono text-xs font-semibold text-[#064E3B] block">consumer@ncc.gov.ng</span>
                <span className="text-[11px] text-slate-500">Formal written submissions</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                4. Present Structured Evidence
              </span>
              <span className="text-xs text-slate-500">SignalPulse Dossier</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Attach your <strong>SignalPulse Evidence Dossier</strong>. Providing exact attempt timestamps, local LGA context, ticket references, and application test records removes ambiguity and accelerates investigation.
            </p>
          </div>
        </div>
      </section>

      {/* Sourced Frameworks */}
      <section aria-labelledby="frameworks-title" className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 id="frameworks-title" className="text-base font-bold text-slate-900">
          Statutory Standards & Protection Rules
        </h2>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Quality of Service (QoS) Regulations</span>
              <span className="font-mono text-slate-400">Gazette No. 118</span>
            </div>
            <p className="text-slate-600">
              Prescribes minimum performance thresholds including Call Setup Success Rate (&gt; 98%), Dropped Call Rate (&lt; 1%), and data latency benchmarks.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Consumer Code of Practice Regulations</span>
              <span className="font-mono text-slate-400">Section 80</span>
            </div>
            <p className="text-slate-600">
              Mandates that licensees must resolve billing anomalies, credit consumers for unwarranted debits, and maintain transparent complaint procedures.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Do-Not-Disturb (DND) Shortcode</span>
              <span className="font-mono text-slate-400">2442</span>
            </div>
            <p className="text-slate-600">
              To stop unsolicited promotional SMS messages and unwanted VAS debits, text &quot;STOP&quot; to 2442 for full opt-out, or &quot;HELP&quot; to customize.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to Evidence Builder */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Ready to assemble your evidence?</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Export your private Evidence Dossier to attach when escalating with your provider or the Commission.
          </p>
        </div>
        <a
          href="/evidence"
          className="min-h-[44px] rounded-md bg-[#064E3B] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#022C22] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Open Evidence Builder</span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
