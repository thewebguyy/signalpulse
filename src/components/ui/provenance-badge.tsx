import type { Provenance } from "@/contracts/domain";
import { PROVENANCE_METAS } from "@/components/constants";
import { SignalWaveIcon, DeviceBeaconIcon, DocketPenIcon, PaperclipIcon, OfficialShieldIcon } from "@/components/icons";

interface ProvenanceBadgeProps {
  provenance: Provenance;
  className?: string;
  showIcon?: boolean;
}

export function ProvenanceBadge({ provenance, className = "", showIcon = true }: ProvenanceBadgeProps) {
  const meta = PROVENANCE_METAS[provenance] ?? PROVENANCE_METAS.user_reported;

  const renderIcon = () => {
    switch (provenance) {
      case "app_measured":
        return <SignalWaveIcon className="h-3 w-3 inline-block shrink-0" aria-hidden="true" />;
      case "device_observed":
        return <DeviceBeaconIcon className="h-3 w-3 inline-block shrink-0" aria-hidden="true" />;
      case "user_reported":
        return <DocketPenIcon className="h-3 w-3 inline-block shrink-0" aria-hidden="true" />;
      case "user_attached":
        return <PaperclipIcon className="h-3 w-3 inline-block shrink-0" aria-hidden="true" />;
      case "official_source":
        return <OfficialShieldIcon className="h-3 w-3 inline-block shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.textColor,
        border: `1px solid ${meta.borderColor}`,
      }}
      title={`${meta.label}: ${meta.description}`}
    >
      {showIcon && renderIcon()}
      <span>{meta.label}</span>
    </span>
  );
}
