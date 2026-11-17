import Link from "next/link";
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 items-start gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-100 text-emerald-900">
              <OfficialShieldIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              NCC Consumer Guidance
            </h1>
          </div>
          <ProvenanceBadge provenance="official_source" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Statutory complaint escalation procedures and consumer rights frameworks published by the Nigerian Communications Commission (NCC).
        </p>
      </div>

      {/* Independence & Non-Endorsement Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <OfficialShieldIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
          <span>Independent Platform Disclaimer</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          SignalPulse NG is an independent civic technology platform. It is neither affiliated with nor endorsed by the Nigerian Communications Commission (NCC). The guidance below is transcribed directly from public regulatory gazettes and official publications. Enforcement decisions, dispute settlements, and compensation determinations rest solely with the Commission and licensed service providers.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span>Authority: Nigerian Communications Commission</span>
          <span>·</span>
          <span>Instruments: NCA 2003, Consumer Code of Practice Regulations</span>
          <span>·</span>
          <span className="font-semibold text-slate-600">Audited: November 2026</span>
        </div>
      </div>

      {/* 4-Step Mandatory Consumer Pathway */}
      <section aria-labelledby="pathway-title" className="space-y-4">
        <div>
          <h2 id="pathway-title" className="text-lg font-bold text-slate-900">
            Mandatory Dispute Escalation Pathway
          </h2>
          <p className="text-xs text-slate-500">
            Follow this statutory sequential pathway to ensure your complaint complies with NCC Consumer Affairs Bureau requirements.
          </p>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                1. Lodge Complaint with Service Provider First
              </span>
              <span className="text-xs font-semibold text-[#064E3B]">Mandatory First Step</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Under NCC regulations, you <strong>must first lodge your complaint directly with your mobile network provider</strong> (MTN, Airtel, Globacom, or T2mobile) via their customer care line, official email, support app, or service center.
            </p>
            <div className="rounded bg-slate-50 p-3 text-xs border border-slate-200 text-slate-700">
              <strong className="text-slate-900">Essential Requirement: </strong>
              Always obtain and record an official <strong>Complaint Ticket or Reference ID</strong> from the customer service representative. The NCC Consumer Affairs Bureau will not intervene in any dispute without a documented provider ticket number.
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                2. Sourced Resolution Timelines &amp; Escalation Window
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Statutory Provisions
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Licensees are obligated to resolve complaints diligently under their approved Individual Consumer Code of Practice (ICCP). Note the explicit statutory scopes and regulatory limits:
            </p>
            <div className="grid gap-3 sm:grid-cols-3 pt-1 text-xs">
              <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Information Inquiries</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded font-medium">Sec. 80</span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#064E3B] block">96 Hours</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Applies strictly to general service inquiries and tariff terms under Consumer Code of Practice Regulations § 80.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
                  Note: Not an operational network restoration guarantee.
                </div>
              </div>

              <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Escalation Window</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded font-medium">ICCP Threshold</span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#064E3B] block">30 Days</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Statutory threshold after which unresolved complaints can be escalated directly to the NCC Consumer Affairs Bureau.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
                  Note: Operating turnaround times vary by carrier ICCP.
                </div>
              </div>

              <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Outer Dispute Limit</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded font-medium">Dispute Rules</span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#064E3B] block">90 Days</span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                    Under NCC Dispute Resolution Guidelines, pending formal disputes cannot linger unresolved past 3 months.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
                  Note: Governs formal Commission dispute proceedings.
                </div>
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
                Audited Channels
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              If your mobile operator fails to resolve your issue within the prescribed period, or offers an unsatisfactory outcome, escalate to the Commission through any verified channel:
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Toll-Free Contact Center</span>
                <span className="font-mono text-base font-bold text-[#064E3B] block">622</span>
                <span className="text-[11px] text-slate-500">Toll-free from any Nigerian mobile network</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Online Consumer Portal</span>
                <a
                  href="https://consumer.ncc.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-[#064E3B] hover:underline block break-all"
                >
                  consumer.ncc.gov.ng
                </a>
                <span className="text-[11px] text-slate-500">Official dispute submission &amp; tracking</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Official Escalation Email</span>
                <span className="font-mono text-xs font-semibold text-[#064E3B] block break-all">
                  consumer@ncc.gov.ng
                </span>
                <span className="text-[11px] text-slate-500">Formal written submissions with ticket ID</span>
              </div>
            </div>

            {/* Zonal Office Notice */}
            <div className="rounded bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-200">
              <strong className="text-slate-900">Lagos Zonal Office: </strong>
              9A, Bankole Oki Street, Behind Ikoyi Club, Ikoyi, Lagos State. Physical complaint submissions may be delivered in writing (max 2 pages, signed, with ticket reference attached).
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                4. Present Structured Evidence
              </span>
              <span className="text-xs font-semibold text-slate-500">SignalPulse Dossier</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Attach your <strong>SignalPulse Evidence Dossier</strong>. Submitting a clear, chronological summary of timestamped incident occurrences, LGA context, and your provider ticket number removes ambiguity and helps regulatory officers review your case quickly.
            </p>
          </div>
        </div>
      </section>

      {/* Sourced Frameworks & Non-Conflation Notice */}
      <section aria-labelledby="frameworks-title" className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 id="frameworks-title" className="text-base font-bold text-slate-900">
          Statutory Standards &amp; Protection Frameworks
        </h2>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Quality of Service (QoS) Regulations &amp; Business Rules</span>
              <span className="font-mono text-slate-400">Gazette No. 118 / QoS Rules</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Prescribes system-level performance KPIs including Dropped Call Rates (&lt; 1%), Call Setup Success Rates (&gt; 98%), and Network Availability.
            </p>
            <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded border border-amber-200/80 mt-1">
              <strong>Regulatory Distinction:</strong> Quality-of-service benchmarks are network-wide indicators measured across Local Government Areas (LGAs). Under NCC QoS Business Rules, systemic breaches trigger automatic, operator-administered restitution to qualifying subscribers in affected clusters, rather than individual compensation claims based on private speed tests.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Consumer Code of Practice Regulations</span>
              <span className="font-mono text-slate-400">Section 80 et seq.</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Mandates that licensees must resolve billing anomalies, credit consumers for unwarranted debits or service outages, provide clear terms, and maintain records of complaints and billing for a minimum of 24 months (2 years).
            </p>
          </div>

          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Do-Not-Disturb (DND) Shortcode</span>
              <span className="font-mono text-slate-400">Shortcode 2442</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              To stop unsolicited promotional SMS messages and unwanted third-party Value-Added Service (VAS) debits, send &quot;STOP&quot; to 2442 for full opt-out, or &quot;HELP&quot; to select specific categories.
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
        <Link
          href="/evidence"
          className="min-h-[44px] rounded-md bg-[#064E3B] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#022C22] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Open Evidence Builder</span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
