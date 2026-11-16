import { LAGOS_LGAS } from "@/components/constants";
import { LockClosedIcon } from "@/components/icons";

interface AreaSelectorProps {
  value: string;
  onChange: (areaId: string) => void;
  id?: string;
  disabled?: boolean;
}

export function AreaSelector({
  value,
  onChange,
  id = "lagos-lga-select",
  disabled = false,
}: AreaSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-[#121514]">
          Lagos State LGA
        </label>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#64706C]">
          <LockClosedIcon className="h-3 w-3 text-[#0C4A3E]" aria-hidden="true" />
          No GPS required
        </span>
      </div>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full min-h-[48px] rounded-md border border-[#64706C]/40 bg-[#FFFFFF] px-3 py-2 text-sm text-[#121514] shadow-xs focus:border-[#0C4A3E] focus:ring-1 focus:ring-[#0C4A3E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Select Lagos Local Government Area...</option>
        {LAGOS_LGAS.map((lga) => (
          <option key={lga.id} value={lga.id}>
            {lga.name} (Lagos)
          </option>
        ))}
      </select>
      <p className="text-[11px] text-[#64706C]">
        Curated Lagos LGAs protect your privacy. Public summaries aggregate strictly at the LGA level.
      </p>
    </div>
  );
}
