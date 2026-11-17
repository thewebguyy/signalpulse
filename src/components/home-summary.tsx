"use client";

import Link from "next/link";
import { useLocalIncidents } from "@/components/local-store";
import { INCIDENT_CATEGORIES, LAGOS_LGAS, OPERATOR_OPTIONS } from "@/components/constants";
import { ArrowRightIcon } from "@/components/icons";

export function HomeRecordsSummary() {
  const incidents = useLocalIncidents();
  const latest = incidents[0];

  if (incidents.length === 0 || !latest) {
    return (
      <section
        aria-label="Your saved records"
        className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">Your saved reports</h2>
          <p className="text-sm text-slate-600">
            No reports saved on this device yet. Everything you log stays private in this browser.
          </p>
        </div>
        <Link
          href="/incidents"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          Start a report
        </Link>
      </section>
    );
  }

  const operatorName =
    OPERATOR_OPTIONS.find((o) => o.code === latest.fields.operator)?.name ?? latest.fields.operator;
  const categoryTitle =
    INCIDENT_CATEGORIES.find((c) => c.code === latest.fields.category)?.title ?? latest.fields.category;
  const areaName =
    LAGOS_LGAS.find((a) => a.id === latest.fields.area_id)?.name ?? latest.fields.area_id;

  return (
    <section
      aria-label="Your saved records"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">
          {incidents.length === 1 ? "1 saved report" : `${incidents.length} saved reports`}
        </h2>
        <span className="text-xs text-slate-500">Saved on this device</span>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900">
            Most recent: {operatorName} · {categoryTitle}
          </span>
          <span>
            {areaName} · {new Date(latest.fields.occurred_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
          </span>
        </div>
        <p className="text-sm text-slate-700 line-clamp-2">{latest.fields.narrative}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/evidence"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
        >
          <span>Continue preparing a complaint</span>
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href="/incidents"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          Add another report
        </Link>
      </div>
    </section>
  );
}
