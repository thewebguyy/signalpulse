import type { Operator } from "@/contracts/domain";
import { OPERATOR_OPTIONS } from "@/components/constants";

interface OperatorSelectorProps {
  value: Operator | null;
  onChange: (operator: Operator) => void;
  idPrefix?: string;
  disabled?: boolean;
}

export function OperatorSelector({
  value,
  onChange,
  idPrefix = "op",
  disabled = false,
}: OperatorSelectorProps) {
  return (
    <fieldset className="space-y-2 border-0 p-0 m-0">
      <legend className="text-sm font-semibold text-slate-900">
        Which network? <span className="text-rose-700" aria-hidden="true">*</span>
      </legend>
      <p className="text-xs text-slate-500">
        Pick the mobile network you were using.
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-1">
        {OPERATOR_OPTIONS.map((op) => {
          const isSelected = value === op.code;
          const inputId = `${idPrefix}-${op.code}`;
          return (
            <label
              key={op.code}
              htmlFor={inputId}
              className={`relative flex min-h-[56px] cursor-pointer flex-col justify-center rounded-md border p-3 transition-all ${
                isSelected
                  ? "border-[#0C4A3E] bg-[#E8F2EF] ring-2 ring-[#0C4A3E]/20 shadow-xs"
                  : "border-[#E5E2DC] bg-[#FFFFFF] hover:border-[#64706C] hover:bg-[#FBFBFA]"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                id={inputId}
                name={`${idPrefix}-operator-radio`}
                value={op.code}
                checked={isSelected}
                onChange={() => !disabled && onChange(op.code)}
                disabled={disabled}
                className="sr-only"
              />
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: op.brandColor }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-sm text-[#121514] leading-tight">
                  {op.name.split(" ")[0]}
                </span>
              </div>
              <span className="mt-1 text-[11px] text-[#64706C] truncate">
                {op.name}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
