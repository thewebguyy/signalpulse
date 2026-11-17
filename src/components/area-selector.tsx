import { LAGOS_LGAS } from "@/components/constants";

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
      <label htmlFor={id} className="text-sm font-semibold text-slate-900 block">
        Where in Lagos? <span className="text-rose-700" aria-hidden="true">*</span>
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full min-h-[48px] rounded-md border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-slate-900 focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Choose your area in Lagos...</option>
        {LAGOS_LGAS.map((lga) => (
          <option key={lga.id} value={lga.id}>
            {lga.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500">
        Pick your local government area—no GPS needed.
      </p>
    </div>
  );
}
