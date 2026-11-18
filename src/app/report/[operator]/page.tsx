import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { operatorSchema } from "@/contracts/domain";
import type { Operator } from "@/contracts/domain";
import { OPERATOR_OPTIONS } from "@/components/constants";
import { ReportForm } from "@/components/report-form";
import { ArrowRightIcon, GitHubIcon, LockClosedIcon, OfficialShieldIcon } from "@/components/icons";

interface OperatorReportPageProps {
  params: Promise<{ operator: string }>;
}

export function generateStaticParams() {
  return [
    { operator: "mtn" },
    { operator: "airtel" },
    { operator: "glo" },
    { operator: "t2mobile" },
  ];
}

export async function generateMetadata({
  params,
}: OperatorReportPageProps): Promise<Metadata> {
  const { operator } = await params;
  const parsed = operatorSchema.safeParse(operator);
  if (!parsed.success) return { title: "Report Network Problem — SignalPulse NG" };

  const op = OPERATOR_OPTIONS.find((o) => o.code === parsed.data);
  const name = op ? op.name : "Mobile Network";

  return {
    title: `Bad network on ${name}? Keep a record — SignalPulse NG`,
    description: `Log dropped calls, unusable internet, or billing disputes on ${name}. Private, structured evidence on your device.`,
  };
}

export default async function OperatorReportPage({ params }: OperatorReportPageProps) {
  const { operator } = await params;
  const parsed = operatorSchema.safeParse(operator);

  if (!parsed.success) {
    notFound();
  }

  const selectedOp: Operator = parsed.data;
  const opInfo = OPERATOR_OPTIONS.find((o) => o.code === selectedOp) ?? OPERATOR_OPTIONS[0]!;

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-6 sm:py-10">
      {/* Network Specific Badge & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/10"
            style={{ backgroundColor: opInfo.brandColor }}
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm font-semibold text-slate-900">
            Reporting for: <strong className="text-emerald-950">{opInfo.name}</strong>
          </span>
        </div>

        <Link
          href="/report"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
        >
          Switch to another network
        </Link>
      </div>

      {/* Hero */}
      <section aria-labelledby="report-hero-title" className="space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200">
          <LockClosedIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
          <span>Independent & Private · Stored on this phone</span>
        </div>

        <h1
          id="report-hero-title"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
        >
          Bad network on {opInfo.name.split(" ")[0]}? Keep a record.
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl">
          Calls dropping? Data not working? Airtime missing? Record what happened and keep the details together.
        </p>
      </section>

      {/* Main Unified Reporting Component with preselected operator */}
      <ReportForm
        initialOperator={selectedOp}
        title={`Report a problem on ${opInfo.name}`}
        subtitle="Saved privately on this phone. You can generate a share card once saved."
        idPrefix={`op-${selectedOp}`}
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

      {/* Escalation Guidance Note */}
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 flex items-start gap-3">
        <OfficialShieldIcon className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-xs text-emerald-950">
          <p className="font-semibold text-sm">
            Keep your complaint evidence organized
          </p>
          <p className="leading-relaxed">
            Always contact your service provider ({opInfo.name}) first to log a formal ticket. If the issue persists past regulatory resolution windows, use your saved SignalPulse evidence when escalating to the NCC.
          </p>
          <Link
            href="/guidance"
            className="inline-block pt-1 font-semibold text-emerald-900 underline underline-offset-4 hover:text-emerald-700"
          >
            Learn about official NCC escalation procedures
          </Link>
        </div>
      </section>
    </main>
  );
}
