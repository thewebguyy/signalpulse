import type { Provenance } from "@/contracts/domain";

interface ProvenanceBadgeProps {
  provenance: Provenance;
  className?: string;
  size?: "sm" | "md";
}

const PROVENANCE_CONFIG: Record<
  Provenance,
  { label: string; bg: string; text: string; border: string; dot: string; title: string }
> = {
  app_measured: {
    label: "App measured",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-600",
    title: "Measured directly by SignalPulse in a bounded application test.",
  },
  device_observed: {
    label: "Device hint",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-600",
    title: "Read from browser APIs as an unverified informational hint.",
  },
  user_reported: {
    label: "User report",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-600",
    title: "Asserted by subscriber; not independently verified.",
  },
  user_attached: {
    label: "User attachment",
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
    dot: "bg-slate-500",
    title: "File or screenshot provided by subscriber; unverified content.",
  },
  official_source: {
    label: "Official source",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
    title: "Published authoritative regulation from the Nigerian Communications Commission.",
  },
};

export function ProvenanceBadge({
  provenance,
  className = "",
  size = "sm",
}: ProvenanceBadgeProps) {
  const config = PROVENANCE_CONFIG[provenance] ?? PROVENANCE_CONFIG.user_reported;

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5"
      : "text-xs px-2.5 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      title={`${config.label}: ${config.title}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
