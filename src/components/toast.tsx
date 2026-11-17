import { CheckCircleIcon, AlertCircleIcon } from "@/components/icons";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 right-4 z-50 max-w-sm rounded-lg border border-[#0C4A3E]/30 bg-[#FFFFFF] p-4 shadow-lg lg:bottom-6"
    >
      <div className="flex items-start gap-3">
        {toast.type === "success" ? (
          <CheckCircleIcon className="h-5 w-5 text-[#0C4A3E] shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <AlertCircleIcon className="h-5 w-5 text-[#92400E] shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-sm text-[#121514]">{toast.title}</p>
          {toast.message && <p className="text-xs text-[#3F4946] mt-0.5">{toast.message}</p>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#64706C] hover:text-[#121514] text-xs font-semibold p-1"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
