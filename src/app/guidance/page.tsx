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
              2. Follow up within the provider&apos;s communicated timeframe
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              When you log a complaint, your network provider must provide a unique ticket or reference number and an expected resolution timeframe:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">General service inquiries</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Under NCC Consumer Code of Practice Regulations 2024 highlights, providers must respond to basic tariff and service-information inquiries promptly (within 96 hours).
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Network faults &amp; billing disputes</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Operational repair and billing resolution timelines depend on fault severity and each network&apos;s approved Individual Consumer Code of Practice (ICCP). Follow up if the promised date passes without resolution.
                </p>
              </div>
            </div>

            <details className="text-xs text-slate-500 pt-1">
              <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                Official NCC guidance &amp; regulations
              </summary>
              <ul className="mt-2 space-y-1.5 list-disc pl-4 leading-relaxed text-slate-600">
                <li>
                  <a
                    href="https://consumer.ncc.gov.ng/consumer-complaints/procedure-to-file-a-complaint/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#064E3B] underline underline-offset-2 hover:text-[#022C22]"
                  >
                    NCC Procedure to File a Complaint
                  </a>: Consumers must first lodge complaints directly with their service provider before escalating.
                </li>
                <li>
                  <a
                    href="https://consumer.ncc.gov.ng/articles/126-before-you-escalate-your-complaint-steps-to-take-first"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#064E3B] underline underline-offset-2 hover:text-[#022C22]"
                  >
                    Steps to Take Before You Escalate
                  </a>: Always retain your complaint reference ticket, details of interactions, and dates.
                </li>
                <li>
                  <a
                    href="https://consumer.ncc.gov.ng/articles/104-highlights-of-the-ncc-consumer-code-of-practice-regulations-2024"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#064E3B] underline underline-offset-2 hover:text-[#022C22]"
                  >
                    Highlights of the NCC Consumer Code of Practice Regulations 2024
                  </a>: Sets standards for customer care, complaint handling, and consumer rights.
                </li>
              </ul>
            </details>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              3. Escalate to the NCC if unresolved or unsatisfactory
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              If your network provider does not resolve the fault within their communicated timeframe, or if the outcome is unsatisfactory, escalate directly to the NCC Consumer Affairs Bureau:
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
        SignalPulse NG is an independent evidence platform and is not affiliated with the Nigerian Communications Commission (NCC) or any telecommunications carrier. We cannot guarantee compensation, refunds, or network repairs. Guidance last reviewed November 2026 against current NCC Consumer Affairs publications and the NCC Consumer Code of Practice Regulations 2024.
      </p>
    </main>
  );
}
