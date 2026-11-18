/**
 * Timezone and datetime utilities for SignalPulse NG.
 * Prevents UTC/local offset drift when editing or displaying timestamps.
 */

/**
 * Converts a Date or ISO 8601 string to a format suitable for HTML `<input type="datetime-local">`
 * (`YYYY-MM-DDTHH:mm`) in the user's local timezone.
 */
export function toLocalDateTimeInputValue(dateOrIso?: Date | string | null): string {
  if (!dateOrIso) return "";
  const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts an HTML `<input type="datetime-local">` string (`YYYY-MM-DDTHH:mm`)
 * into a canonical UTC ISO 8601 string.
 */
export function fromLocalDateTimeInputValue(
  localValue?: string | null,
  fallbackIso?: string
): string {
  if (!localValue || !localValue.trim()) {
    return fallbackIso ?? new Date().toISOString();
  }
  const d = new Date(localValue);
  if (isNaN(d.getTime())) {
    return fallbackIso ?? new Date().toISOString();
  }
  return d.toISOString();
}

/**
 * Formats an ISO 8601 date string for user display in Africa/Lagos (West Africa Time, WAT).
 */
export function formatDisplayDateTimeWAT(isoString?: string | null): string {
  if (!isoString) return "Unknown date/time";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "Invalid date";

  try {
    const formatted = d.toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formatted} WAT`;
  } catch {
    // Fallback if Intl fails
    return d.toLocaleString("en-NG");
  }
}
