import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import {
  OfficialShieldIcon,
  ArrowRightIcon,
} from "@/components/icons";

export default function GuidancePage() {
  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ECFDF5] text-[#065F46]">
            <OfficialShieldIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#121514] sm:text-3xl">
            NCC Consumer Guidance
          </h1>
          <ProvenanceBadge provenance="official_source" />
        </div>
        <p className="text-sm leading-relaxed text-[#3F4946]">
          Authoritative consumer rights, mandatory escalation procedures, and compensation guidelines published by the Nigerian Communications Commission (NCC).
        </p>
      </div>

      {/* Official Sourced Disclaimer Banner */}
      <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-5 text-xs text-[#065F46] space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <OfficialShieldIcon className="h-4 w-4" aria-hidden="true" />
          <span>Independent Informational Stance</span>
        </div>
        <p className="leading-relaxed">
          SignalPulse NG is an independent evidence platform, not the regulator or a legal advisor. The guidance below is compiled from official NCC regulations. Regulatory decisions and compensation remedies remain at the sole discretion of the Commission and relevant service providers.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px] text-[#047857]">
          <span>Source: NCC Consumer Code of Practice Regulations</span>
          <span>·</span>
          <span>Last Verified: November 2026</span>
          <span>·</span>
          <span>Jurisdiction: Nigeria</span>
        </div>
      </div>

      {/* 4-Step Mandatory Consumer Escalation Roadmap */}
      <section aria-labelledby="escalation-roadmap-heading" className="space-y-4">
        <h2 id="escalation-roadmap-heading" className="text-lg font-bold text-[#121514]">
          The 4-Step Official Dispute Escalation Roadmap
        </h2>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C4A3E] text-white font-mono text-xs font-bold">
                  1
                </span>
                <h3 className="font-bold text-sm text-[#121514]">
                  Lodge Complaint Directly with Telecom Operator
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#0C4A3E]">Mandatory First Step</span>
            </div>
            <p className="text-xs leading-relaxed text-[#3F4946] pl-8">
              Under NCC regulations, you must give your network provider (MTN, Airtel, Glo, or T2mobile) the statutory opportunity to resolve the issue. Always request and record an official <strong>Ticket / Reference ID</strong> and the agent&apos;s name.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C4A3E] text-white font-mono text-xs font-bold">
                  2
                </span>
                <h3 className="font-bold text-sm text-[#121514]">
                  Allow Statutory Resolution Timeframes
                </h3>
              </div>
              <span className="text-xs font-mono text-[#64706C]">Statutory Waiting Period</span>
            </div>
            <p className="text-xs leading-relaxed text-[#3F4946] pl-8">
              The NCC prescribes standard resolution windows before escalating:
            </p>
            <div className="pl-8 grid gap-2 sm:grid-cols-3 pt-1 text-xs">
              <div className="rounded bg-[#F4F3F0] p-2.5">
                <strong className="text-[#121514] block">Service Outage / Drop:</strong>
                <span className="text-[#64706C]">24 to 72 hours</span>
              </div>
              <div className="rounded bg-[#F4F3F0] p-2.5">
                <strong className="text-[#121514] block">Billing / Tariff Dispute:</strong>
                <span className="text-[#64706C]">7 to 14 business days</span>
              </div>
              <div className="rounded bg-[#F4F3F0] p-2.5">
                <strong className="text-[#121514] block">SIM Registration / VAS:</strong>
                <span className="text-[#64706C]">48 hours</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-[#0C4A3E]/30 bg-[#FFFFFF] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C4A3E] text-white font-mono text-xs font-bold">
                  3
                </span>
                <h3 className="font-bold text-sm text-[#121514]">
                  Escalate to the Nigerian Communications Commission (NCC)
                </h3>
              </div>
              <span className="rounded bg-[#ECFDF5] px-2 py-0.5 text-xs font-bold text-[#065F46] border border-[#A7F3D0]">
                Toll-Free 622
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#3F4946] pl-8">
              If your operator fails to resolve the complaint within the window, or provides an unsatisfactory response, escalate to the NCC Consumer Affairs Bureau:
            </p>
            <div className="pl-8 grid gap-2 sm:grid-cols-3 pt-1 text-xs">
              <div className="rounded border border-[#E5E2DC] bg-[#FBFBFA] p-3">
                <span className="font-bold text-[#121514] block">Toll-Free Hotline</span>
                <span className="font-mono text-base font-bold text-[#0C4A3E]">622</span>
                <span className="text-[11px] text-[#64706C] block mt-0.5">Mon–Fri 8:00 AM – 5:00 PM</span>
              </div>
              <div className="rounded border border-[#E5E2DC] bg-[#FBFBFA] p-3">
                <span className="font-bold text-[#121514] block">Complaints Portal</span>
                <span className="font-mono text-xs text-[#0C4A3E] font-semibold break-all">consumer.ncc.gov.ng</span>
                <span className="text-[11px] text-[#64706C] block mt-0.5">Online dispute filing</span>
              </div>
              <div className="rounded border border-[#E5E2DC] bg-[#FBFBFA] p-3">
                <span className="font-bold text-[#121514] block">Consumer Email</span>
                <span className="font-mono text-xs text-[#0C4A3E] font-semibold">consumer@ncc.gov.ng</span>
                <span className="text-[11px] text-[#64706C] block mt-0.5">Attach written evidence</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C4A3E] text-white font-mono text-xs font-bold">
                  4
                </span>
                <h3 className="font-bold text-sm text-[#121514]">
                  Provide Structured Evidence Dossier
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#0C4A3E]">SignalPulse Dossier</span>
            </div>
            <p className="text-xs leading-relaxed text-[#3F4946] pl-8">
              Submit your timestamped <strong>SignalPulse Evidence Dossier</strong>. A structured record showing exact attempt times, locations, error prompts, and HTTP check results dramatically expedites regulatory review.
            </p>
          </div>
        </div>
      </section>

      {/* Sourced Regulatory References */}
      <section aria-labelledby="regulatory-heading" className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
        <h2 id="regulatory-heading" className="text-base font-bold text-[#121514]">
          Key Regulatory Standards & Statutory Frameworks
        </h2>

        <div className="divide-y divide-[#E5E2DC] text-xs">
          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#121514]">NCC Quality of Service (QoS) Regulations</span>
              <span className="font-mono text-[11px] text-[#64706C]">Gazette No. 118</span>
            </div>
            <p className="text-[#3F4946]">
              Establishes mandatory thresholds for Call Setup Success Rate (CSSR &gt; 98%), Dropped Call Rate (DCR &lt; 1%), and minimum broadband download throughput.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#121514]">Consumer Code of Practice & Compensation</span>
              <span className="font-mono text-[11px] text-[#64706C]">Section 80 Regulations</span>
            </div>
            <p className="text-[#3F4946]">
              Directs operators to credit consumers for unwarranted debits, unauthorized VAS subscriptions, or persistent billing discrepancies upon substantiation.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#121514]">Do-Not-Disturb (DND) Facility</span>
              <span className="font-mono text-[11px] text-[#64706C]">Shortcode 2442</span>
            </div>
            <p className="text-[#3F4946]">
              Subscribers can stop unsolicited SMS marketing and VAS promotions by texting &quot;STOP&quot; to shortcode 2442 (Full DND) or &quot;HELP&quot; to customize categories.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Call to Action */}
      <div className="rounded-lg border border-[#0C4A3E] bg-[#E8F2EF] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#0C4A3E]">Ready to assemble your dispute record?</h3>
          <p className="text-xs text-[#3F4946]">
            Export your private Evidence Dossier to attach when contacting your operator or dialing 622.
          </p>
        </div>
        <a
          href="/evidence"
          className="min-h-[44px] rounded-md bg-[#0C4A3E] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#08352C] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Open Evidence Builder</span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
