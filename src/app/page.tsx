import Link from "next/link";
import { Notice } from "@/components/ui/notice";
import { Section } from "@/components/ui/section";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { CONTRACT_IMPLEMENTATION, CONTRACT_VERSION } from "@/contracts/version";
import { readFoundationPreview } from "@/server/foundation";
import {
  SignalWaveIcon,
  DocketPenIcon,
  PaperclipIcon,
  OfficialShieldIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@/components/icons";

export default function HomePage() {
  const preview = readFoundationPreview();

  return (
    <main id="main" className="mx-auto max-w-5xl space-y-8 sm:space-y-10 px-3 sm:px-6 py-6 sm:py-12">
      {/* Hero Header */}
      <header className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-[#0C4A3E]/10 px-2 py-0.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0C4A3E]">
            Lagos Consumer Evidence
          </span>
          <span className="rounded-sm border border-[#E5E2DC] bg-[#FFFFFF] px-2 py-0.5 text-[11px] sm:text-xs font-medium text-[#64706C]">
            Wire {CONTRACT_VERSION} · Impl {CONTRACT_IMPLEMENTATION}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#121514] leading-tight break-words">
          Measure what can be measured. <br className="hidden sm:inline" />
          <span className="text-[#0C4A3E]">Document what happened.</span> <br className="hidden sm:inline" />
          Understand what to do next.
        </h1>

        <p className="max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-[#3F4946]">
          SignalPulse NG is an independent connectivity intelligence and consumer-evidence tool for Nigerian mobile subscribers. It separates factual measurements from user claims, generates timestamped dispute dossiers, and outlines official NCC escalation channels.
        </p>
      </header>

      {/* Engineering Preview Notice */}
      <Notice title="Local Engineering Foundation & Synthetic Preview">
        <p className="text-xs sm:text-sm text-[#78350F]">
          {preview.warning} All interactions operate strictly in-browser using local storage. Live network endpoints, uploads, carrier billing audits, and production databases are intentionally disabled in this milestone.
        </p>
      </Notice>

      {/* 4-Stage Action Loop Grid */}
      <section aria-labelledby="workflow-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="workflow-heading" className="text-lg sm:text-xl font-bold tracking-tight text-[#121514]">
            The 4-Stage Subscriber Loop
          </h2>
          <span className="text-xs font-medium text-[#64706C]">Core Workflow</span>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Check */}
          <Link
            href="/check"
            className="group flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs transition-all hover:border-[#0C4A3E] hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-[#EFF6FF] text-[#1D4ED8]">
                  <SignalWaveIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-mono text-[#64706C]">01</span>
              </div>
              <h3 className="mt-3 sm:mt-4 font-bold text-sm sm:text-base text-[#121514] group-hover:text-[#0C4A3E] transition-colors">
                1. Network Check
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-[#3F4946]">
                Run a bounded, user-initiated HTTP latency and download test under disclosed conditions.
              </p>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-[#E5E2DC] pt-3 text-xs font-semibold text-[#0C4A3E]">
              <ProvenanceBadge provenance="app_measured" />
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 2: Journal */}
          <Link
            href="/incidents"
            className="group flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs transition-all hover:border-[#0C4A3E] hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-[#FEF3C7] text-[#92400E]">
                  <DocketPenIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-mono text-[#64706C]">02</span>
              </div>
              <h3 className="mt-3 sm:mt-4 font-bold text-sm sm:text-base text-[#121514] group-hover:text-[#0C4A3E] transition-colors">
                2. Incident Journal
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-[#3F4946]">
                Document failed calls, dropped calls, unusable data, or billing disputes with factual details.
              </p>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-[#E5E2DC] pt-3 text-xs font-semibold text-[#0C4A3E]">
              <ProvenanceBadge provenance="user_reported" />
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 3: Evidence */}
          <Link
            href="/evidence"
            className="group flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs transition-all hover:border-[#0C4A3E] hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-[#F1F5F9] text-[#334155]">
                  <PaperclipIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-mono text-[#64706C]">03</span>
              </div>
              <h3 className="mt-3 sm:mt-4 font-bold text-sm sm:text-base text-[#121514] group-hover:text-[#0C4A3E] transition-colors">
                3. Evidence Builder
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-[#3F4946]">
                Assemble private timestamped dossiers combining incident logs, measurements, and factual narratives.
              </p>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-[#E5E2DC] pt-3 text-xs font-semibold text-[#0C4A3E]">
              <span className="text-[11px] font-semibold text-[#3F4946]">MULTI-SOURCE</span>
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 4: Guidance */}
          <Link
            href="/guidance"
            className="group flex flex-col justify-between rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-4 sm:p-5 shadow-xs transition-all hover:border-[#0C4A3E] hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-[#ECFDF5] text-[#065F46]">
                  <OfficialShieldIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-mono text-[#64706C]">04</span>
              </div>
              <h3 className="mt-3 sm:mt-4 font-bold text-sm sm:text-base text-[#121514] group-hover:text-[#0C4A3E] transition-colors">
                4. Take Action
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-[#3F4946]">
                Understand the mandatory 2-step escalation: telco ticket reference first, then NCC Toll-Free 622.
              </p>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-[#E5E2DC] pt-3 text-xs font-semibold text-[#0C4A3E]">
              <ProvenanceBadge provenance="official_source" />
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* Evidence Taxonomy / Truth Matrix */}
      <section aria-labelledby="taxonomy-heading" className="rounded-xl border border-[#E5E2DC] bg-[#FFFFFF] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-[#0C4A3E]" aria-hidden="true" />
            <h2 id="taxonomy-heading" className="text-base sm:text-lg font-bold text-[#121514]">
              Measurement Truth & Evidentiary Taxonomy
            </h2>
          </div>
          <p className="text-xs text-[#3F4946]">
            Every data point in SignalPulse NG carries an unambiguous provenance label. User claims are never silently promoted to verified tests.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          <div className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF]/60 p-3 sm:p-3.5 space-y-1.5">
            <ProvenanceBadge provenance="app_measured" />
            <p className="text-xs font-semibold text-[#1E40AF]">Direct Application Measurement</p>
            <p className="text-xs text-[#3F4946]">
              Measured directly by SignalPulse in a bounded test under recorded network conditions (HTTP latency, download throughput).
            </p>
          </div>

          <div className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF]/60 p-3 sm:p-3.5 space-y-1.5">
            <ProvenanceBadge provenance="device_observed" />
            <p className="text-xs font-semibold text-[#6D28D9]">Device Observation Hint</p>
            <p className="text-xs text-[#3F4946]">
              Information reported by browser APIs (e.g. estimated downlink, network type). Informational only; not cryptographic proof.
            </p>
          </div>

          <div className="rounded-md border border-[#FDE68A] bg-[#FEF3C7]/60 p-3 sm:p-3.5 space-y-1.5">
            <ProvenanceBadge provenance="user_reported" />
            <p className="text-xs font-semibold text-[#92400E]">Subscriber User Report</p>
            <p className="text-xs text-[#3F4946]">
              Asserted by the subscriber (e.g. dropped call description, selected operator). Preserved as user testimony, not independently verified.
            </p>
          </div>

          <div className="rounded-md border border-[#CBD5E1] bg-[#F1F5F9]/60 p-3 sm:p-3.5 space-y-1.5">
            <ProvenanceBadge provenance="user_attached" />
            <p className="text-xs font-semibold text-[#334155]">User-Attached Document</p>
            <p className="text-xs text-[#3F4946]">
              Subscriber-provided screenshots, bills, or SMS texts. Checksums verify file integrity; contents are not automatically authenticated.
            </p>
          </div>

          <div className="rounded-md border border-[#A7F3D0] bg-[#ECFDF5]/60 p-3 sm:p-3.5 space-y-1.5">
            <ProvenanceBadge provenance="official_source" />
            <p className="text-xs font-semibold text-[#065F46]">Official Regulatory Guidance</p>
            <p className="text-xs text-[#3F4946]">
              Published directly by the Nigerian Communications Commission (NCC) or official gazette with source reference and effective period.
            </p>
          </div>

          <div className="rounded-md border border-[#E5E2DC] bg-[#F4F3F0]/60 p-3 sm:p-3.5 space-y-1.5 flex flex-col justify-center">
            <p className="text-xs font-bold text-[#121514]">Independent Evidence Stance</p>
            <p className="text-xs text-[#3F4946]">
              SignalPulse NG is an independent evidentiary tool, not a regulator, telecom operator, or billing auditor. We do not claim proof of deliberate throttling or fraud.
            </p>
          </div>
        </div>
      </section>

      {/* Foundation Inspection Boundaries (Preserves Codex checks) */}
      <section aria-labelledby="foundation-heading" className="space-y-4">
        <h2 id="foundation-heading" className="text-lg sm:text-xl font-bold tracking-tight text-[#121514]">
          Engineering Foundation Boundaries
        </h2>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <Section id="incident" title="Incident Journal Boundary">
            <p className="font-semibold text-xs sm:text-sm text-[#121514]">Synthetic Incident Example</p>
            <p className="mt-1 font-mono text-xs text-[#64706C] bg-[#F4F3F0] p-2 rounded break-words">
              {preview.incident.fields.narrative}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#64706C]">
              <span>Category: <strong className="text-[#121514]">{preview.incident.fields.category}</strong></span>
              <ProvenanceBadge provenance="user_reported" />
            </div>
          </Section>

          <Section id="evidence" title="Evidence Builder Boundary">
            <p className="text-xs text-[#3F4946]">
              Shared contracts enforce strict separation between user-reported narratives, application measurements, and uploaded assets. Text-only evidence comes before secure uploads.
            </p>
            <div className="mt-3 text-xs text-[#64706C]">
              <span>Export Schema: <strong className="font-mono text-[#121514]">{preview.evidence.export_schema_version}</strong></span>
            </div>
          </Section>

          <Section id="intelligence" title="Public Intelligence Boundary">
            <p className="text-xs text-[#3F4946]">
              {preview.intelligence.limitations[0] ?? "No publishable observations for this cohort."}
            </p>
            <p className="mt-2 text-xs text-[#64706C]">
              Status: <span className="font-mono font-semibold uppercase text-[#92400E]">{preview.intelligence.status}</span>. Synthetic fixtures never qualify for public metrics.
            </p>
          </Section>

          <Section id="integration" title="Frontend Integration Readiness">
            <p className="text-xs text-[#3F4946]">
              Consuming canonical contracts from <code className="text-xs bg-[#F4F3F0] px-1 py-0.5 rounded">@/contracts/*</code>. Wire version <strong className="text-[#121514]">{CONTRACT_VERSION}</strong>; implementation <strong className="text-[#121514]">{CONTRACT_IMPLEMENTATION}</strong>.
            </p>
            <p className="mt-2 text-xs text-[#64706C]">
              Lagos-first scope · MTN · Airtel · Glo · T2mobile.
            </p>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E2DC] pt-6 text-xs text-[#64706C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-[#121514]">SignalPulse NG</span> · Lagos State Independent Connectivity Intelligence
        </div>
        <div className="flex items-center gap-4">
          <Link href="/check" className="hover:text-[#0C4A3E] transition-colors">Check</Link>
          <Link href="/incidents" className="hover:text-[#0C4A3E] transition-colors">Journal</Link>
          <Link href="/evidence" className="hover:text-[#0C4A3E] transition-colors">Evidence</Link>
          <Link href="/intelligence" className="hover:text-[#0C4A3E] transition-colors">Intelligence</Link>
          <Link href="/guidance" className="hover:text-[#0C4A3E] transition-colors">NCC Guidance</Link>
        </div>
      </footer>
    </main>
  );
}
