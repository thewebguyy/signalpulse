import Link from "next/link";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { readFoundationPreview } from "@/server/foundation";
import {
  SignalWaveIcon,
  DocketPenIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from "@/components/icons";

export default function HomePage() {
  const preview = readFoundationPreview();

  return (
    <main id="main" className="mx-auto max-w-5xl space-y-12 px-4 sm:px-6 py-8 sm:py-14">
      {/* Hero: Instant Clarity */}
      <section aria-labelledby="hero-title" className="space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#064E3B]" aria-hidden="true" />
            <span className="font-semibold text-slate-900">Lagos State</span>
            <span className="text-slate-400">·</span>
            <span>Independent Consumer Evidence Platform</span>
          </div>

          <h1 id="hero-title" className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Document mobile network failures. <br className="hidden sm:inline" />
            Assemble structured consumer evidence.
          </h1>

          <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            SignalPulse NG gives Nigerian mobile subscribers the tools to measure connection quality, log dropped calls and service failures, and assemble timestamped dispute records for provider escalation and NCC resolution.
          </p>
        </div>

        {/* Primary Immediate CTAs */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2 max-w-2xl">
          <Link
            href="/check"
            className="group flex flex-col justify-between rounded-lg border-2 border-[#064E3B] bg-white p-5 shadow-xs hover:bg-[#ECFDF5] transition-all"
          >
            <div>
              <div className="flex items-center gap-2 text-[#064E3B] font-bold text-sm">
                <SignalWaveIcon className="h-4 w-4" aria-hidden="true" />
                <span>Test Connection</span>
              </div>
              <h2 className="mt-2 font-bold text-base text-slate-900">Run Network Check</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Measure application-level HTTP latency and download throughput under transparent, disclosed test bounds.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#064E3B] pt-3 border-t border-slate-100">
              <ProvenanceBadge provenance="app_measured" />
              <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Start test <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>

          <Link
            href="/incidents"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-400 transition-all"
          >
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <DocketPenIcon className="h-4 w-4" aria-hidden="true" />
                <span>Document Failure</span>
              </div>
              <h2 className="mt-2 font-bold text-base text-slate-900">Log Service Incident</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Record dropped calls, unusable data, airtime purchase failures, or billing discrepancies in a factual format.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-700 pt-3 border-t border-slate-100">
              <ProvenanceBadge provenance="user_reported" />
              <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Create record <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Synthetic Preview Notice */}
      <section aria-labelledby="status-note" className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 sm:p-5 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <LockClosedIcon className="h-4 w-4 text-amber-800 shrink-0" aria-hidden="true" />
          <h2 id="status-note">Local Application Milestone & Synthetic Demonstration</h2>
        </div>
        <p className="leading-relaxed text-amber-900/90">
          {preview.warning} All interactions operate strictly in-browser using local storage. Production measurement endpoints, cloud authentication, and live carrier billing audits are deliberately disabled in this milestone.
        </p>
      </section>

      {/* Truth & Scope: What We Do and Do Not Claim */}
      <section aria-labelledby="scope-title" className="space-y-4">
        <h2 id="scope-title" className="text-xl font-bold tracking-tight text-slate-900">
          Evidentiary Standards & Scope Boundaries
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">What We Measure</div>
            <h3 className="font-semibold text-sm text-slate-900">Direct Application Tests</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              HTTP round-trip request latency and download throughput executed under recorded conditions with explicit data consumption caps.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800">What We Preserve</div>
            <h3 className="font-semibold text-sm text-slate-900">Subscriber Testimony</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Your factual narratives, incident times, chosen operator, and telco ticket reference numbers, compiled into a timestamped dossier.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">What We Do Not Claim</div>
            <h3 className="font-semibold text-sm text-slate-900">No Inferred Accusations</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              We never infer billing fraud, tower failure, or deliberate carrier throttling from throughput drops alone. We are an independent evidence tool, not a regulator or telecom operator.
            </p>
          </div>
        </div>
      </section>

      {/* The 4-Step Consumer Action Framework */}
      <section aria-labelledby="process-title" className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div>
          <h2 id="process-title" className="text-xl font-bold text-slate-900">
            How Consumer Escalation Works
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            A clear, legally grounded path from network problem to official resolution.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 border-l-2 border-[#064E3B] pl-3.5">
            <div className="text-xs font-bold text-slate-400">Step 1</div>
            <h3 className="font-semibold text-sm text-slate-900">Test & Document</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture HTTP latency and download stats during the problem, or log what failed.
            </p>
          </div>

          <div className="space-y-1.5 border-l-2 border-[#064E3B] pl-3.5">
            <div className="text-xs font-bold text-slate-400">Step 2</div>
            <h3 className="font-semibold text-sm text-slate-900">Contact Operator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lodge a complaint with MTN, Airtel, Glo, or T2mobile and obtain a ticket reference number.
            </p>
          </div>

          <div className="space-y-1.5 border-l-2 border-[#064E3B] pl-3.5">
            <div className="text-xs font-bold text-slate-400">Step 3</div>
            <h3 className="font-semibold text-sm text-slate-900">Assemble Dossier</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use Evidence Builder to combine your incident log, ticket ref, and test records into one private file.
            </p>
          </div>

          <div className="space-y-1.5 border-l-2 border-[#064E3B] pl-3.5">
            <div className="text-xs font-bold text-slate-400">Step 4</div>
            <h3 className="font-semibold text-sm text-slate-900">Escalate to NCC</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If unresolved, dial NCC Toll-Free 622 or lodge on the portal with your factual dossier attached.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-900">SignalPulse NG</span> · Independent Nigerian Connectivity Intelligence
        </div>
        <div className="flex items-center gap-4">
          <Link href="/check" className="hover:text-slate-900">Check</Link>
          <Link href="/incidents" className="hover:text-slate-900">Journal</Link>
          <Link href="/evidence" className="hover:text-slate-900">Evidence</Link>
          <Link href="/intelligence" className="hover:text-slate-900">Intelligence</Link>
          <Link href="/guidance" className="hover:text-slate-900">NCC Guidance</Link>
        </div>
      </footer>
    </main>
  );
}
