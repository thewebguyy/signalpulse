import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function GuidancePage() {
  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Get Help &amp; Escalate
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600">
          Step-by-step guide on how to complain to your mobile network and escalate to the Nigerian Communications Commission (NCC) if they don&apos;t fix it.
        </p>
      </div>

      {/* 4-Step Consumer Pathway */}
      <section aria-labelledby="pathway-title" className="space-y-4">
        <h2 id="pathway-title" className="text-lg font-bold text-slate-900">
          What to do step by step
        </h2>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold text-base text-slate-900">
                1. Report the problem to your network first
              </h3>
              <span className="text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                Required first step
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Before the NCC can step in, you must complain directly to MTN, Airtel, Glo, or T2mobile and get a <strong>ticket or reference number</strong>.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2 text-xs sm:text-sm text-slate-700 pt-1">
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                <strong className="text-slate-900">MTN Nigeria:</strong> Dial <strong className="text-[#064E3B]">300</strong>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                <strong className="text-slate-900">Airtel Nigeria:</strong> Dial <strong className="text-[#064E3B]">300</strong>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                <strong className="text-slate-900">Globacom (Glo):</strong> Dial <strong className="text-[#064E3B]">300</strong>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                <strong className="text-slate-900">T2mobile (formerly 9mobile):</strong> Dial <strong className="text-[#064E3B]">300</strong>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              2. How long it can take
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Under NCC rules, networks have set timeframes depending on the type of issue:
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">96 hours</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For general questions about tariffs or account terms (not physical network repairs).
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">30 days</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If your complaint isn&apos;t resolved after 30 days, you can escalate directly to the NCC.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">90 days</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Maximum time limit for formal NCC dispute resolution proceedings.
                </p>
              </div>
            </div>

            <details className="text-xs text-slate-500 pt-1">
              <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                Official NCC rule references
              </summary>
              <ul className="mt-2 space-y-1 list-disc pl-4 leading-relaxed">
                <li><strong>96 hours:</strong> NCC Consumer Code of Practice Regulations 2007 § 80 (applies to general service inquiries, not operational network restoration).</li>
                <li><strong>30 days:</strong> Statutory escalation window under the Consumer Code; repair timelines vary by each network&apos;s Individual Consumer Code of Practice (ICCP).</li>
                <li><strong>90 days:</strong> Outer dispute limit under NCC Dispute Resolution Guidelines.</li>
              </ul>
            </details>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              3. Escalate to the NCC if it&apos;s still not fixed
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              If your network doesn&apos;t resolve your complaint or gives an unsatisfactory answer, contact the NCC Consumer Affairs Bureau with your ticket number and saved summary:
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                <span className="font-bold text-slate-900 block">Call toll-free</span>
                <span className="text-lg font-bold text-[#064E3B] block">622</span>
                <span className="text-xs text-slate-600">Free from any Nigerian mobile line</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                <span className="font-bold text-slate-900 block">Online portal</span>
                <a
                  href="https://consumer.ncc.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#064E3B] hover:underline block break-all"
                >
                  consumer.ncc.gov.ng
                </a>
                <span className="text-xs text-slate-600">Submit and track a complaint</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                <span className="font-bold text-slate-900 block">Email</span>
                <span className="text-sm font-semibold text-[#064E3B] block break-all">
                  consumer@ncc.gov.ng
                </span>
                <span className="text-xs text-slate-600">Attach your summary and ticket ID</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200">
              <strong className="text-slate-900">Lagos Zonal Office: </strong>
              9A, Bankole Oki Street, Behind Ikoyi Club, Ikoyi, Lagos State. Written complaints can be delivered in person (signed, up to 2 pages, with your ticket number).
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              4. Keep your records ready
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Use SignalPulse to save what happened and print or download a clean summary before you call or submit on the NCC portal.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/incidents"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
              >
                <span>Report a problem</span>
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/evidence"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Prepare a complaint
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Disclaimer */}
      <p className="border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        SignalPulse NG is an independent tool and is not affiliated with the NCC or any mobile network. We cannot guarantee refunds, compensation, or network fixes—only the NCC and your provider make those decisions. Source info checked November 2026 (Nigerian Communications Act 2003 &amp; NCC Consumer Code of Practice Regulations).
      </p>
    </main>
  );
}
