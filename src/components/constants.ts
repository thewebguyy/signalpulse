import type { Operator, IncidentCategory, Provenance } from "@/contracts/domain";

export interface OperatorOption {
  code: Operator;
  name: string;
  brandColor: string;
  accentBg: string;
  tagline: string;
}

export const OPERATOR_OPTIONS: readonly OperatorOption[] = [
  { code: "mtn", name: "MTN Nigeria", brandColor: "#E5A000", accentBg: "#FEF9E7", tagline: "Everywhere you go" },
  { code: "airtel", name: "Airtel Nigeria", brandColor: "#D60000", accentBg: "#FDF2F2", tagline: "A Reason to Imagine" },
  { code: "glo", name: "Globacom (Glo)", brandColor: "#008751", accentBg: "#F0FDF4", tagline: "Unlimited" },
  { code: "t2mobile", name: "T2mobile", brandColor: "#1A5336", accentBg: "#F2F7F4", tagline: "Telephony redefined" },
] as const;

export interface LagosLgaOption {
  id: string;
  name: string;
}

export const LAGOS_LGAS: readonly LagosLgaOption[] = [
  { id: "agege", name: "Agege" },
  { id: "ajeromi-ifelodun", name: "Ajeromi-Ifelodun" },
  { id: "alimosho", name: "Alimosho" },
  { id: "amuwo-odofin", name: "Amuwo-Odofin" },
  { id: "apapa", name: "Apapa" },
  { id: "badagry", name: "Badagry" },
  { id: "epe", name: "Epe" },
  { id: "eti-osa", name: "Eti-Osa" },
  { id: "ibeju-lekki", name: "Ibeju-Lekki" },
  { id: "ifako-ijaiye", name: "Ifako-Ijaiye" },
  { id: "ikeja", name: "Ikeja" },
  { id: "ikorodu", name: "Ikorodu" },
  { id: "kosofe", name: "Kosofe" },
  { id: "lagos-island", name: "Lagos Island" },
  { id: "lagos-mainland", name: "Lagos Mainland" },
  { id: "mushin", name: "Mushin" },
  { id: "ojo", name: "Ojo" },
  { id: "oshodi-isolo", name: "Oshodi-Isolo" },
  { id: "shomolu", name: "Shomolu" },
  { id: "surulere", name: "Surulere" },
] as const;

export interface CategoryOption {
  code: IncidentCategory;
  title: string;
  description: string;
  guidance: string;
}

export const INCIDENT_CATEGORIES: readonly CategoryOption[] = [
  {
    code: "failed_call",
    title: "Failed Call",
    description: "Call did not connect, gave immediate fast-busy signal, or failed with network error.",
    guidance: "Record time attempted, dialed prefix, and network error tone/prompt.",
  },
  {
    code: "dropped_call",
    title: "Dropped Call",
    description: "Active voice call abruptly terminated without either party hanging up.",
    guidance: "Note call duration before drop, approximate location, and signal strength if visible.",
  },
  {
    code: "unusable_internet",
    title: "Unusable Internet",
    description: "Data connection indicates active connection, but requests fail or stall completely.",
    guidance: "Run a Network Check first or record whether DNS/browsing failed completely.",
  },
  {
    code: "suspicious_data_depletion",
    title: "Suspicious Data Depletion",
    description: "Data bundle depleted significantly faster than active foreground device usage.",
    guidance: "Preserve SMS balance notifications, time interval, and foreground data counter if known.",
  },
  {
    code: "failed_airtime_data_purchase",
    title: "Failed Airtime / Data Purchase",
    description: "Bank or mobile money debited for recharge/bundle, but value was not credited.",
    guidance: "Preserve bank transaction reference, debit timestamp, and USSD/SMS response.",
  },
  {
    code: "billing_dispute",
    title: "Billing Dispute",
    description: "Disputed tariff deductions, unexpected VAS charges, or erroneous airtime debits.",
    guidance: "Record shortcode, deduction amount, airtime balance before/after, and opt-out attempts.",
  },
] as const;

export interface ProvenanceMeta {
  code: Provenance;
  label: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const PROVENANCE_METAS: Record<Provenance, ProvenanceMeta> = {
  app_measured: {
    code: "app_measured",
    label: "APP MEASURED",
    description: "Directly measured by SignalPulse in a controlled, bounded test.",
    bgColor: "#EFF6FF",
    textColor: "#1D4ED8",
    borderColor: "#BFDBFE",
  },
  device_observed: {
    code: "device_observed",
    label: "DEVICE HINT",
    description: "Read from browser/device APIs as informational hints (unverified).",
    bgColor: "#F5F3FF",
    textColor: "#6D28D9",
    borderColor: "#DDD6FE",
  },
  user_reported: {
    code: "user_reported",
    label: "USER REPORTED",
    description: "Asserted by subscriber; not independently or cryptographically verified.",
    bgColor: "#FEF3C7",
    textColor: "#92400E",
    borderColor: "#FDE68A",
  },
  user_attached: {
    code: "user_attached",
    label: "USER ATTACHED",
    description: "File or screenshot provided by subscriber; content not auto-verified.",
    bgColor: "#F1F5F9",
    textColor: "#334155",
    borderColor: "#CBD5E1",
  },
  official_source: {
    code: "official_source",
    label: "OFFICIAL SOURCE",
    description: "Published by the Nigerian Communications Commission (NCC) or official gazette.",
    bgColor: "#ECFDF5",
    textColor: "#065F46",
    borderColor: "#A7F3D0",
  },
};

export const TEST_PREVIEW_CONFIG = {
  MAX_DATA_BYTES_CONFIG: 1_500_000,
  DATA_CAP_LABEL: "~1.5 MB illustrative cap",
  MAX_DURATION_MS_CONFIG: 10_000,
  TIMEOUT_LABEL: "10s timeout limit",
  METHOD_VERSION: "browser-http-0.1",
  ENDPOINT_ID: "preview-lagos-http-1",
  NOTICE: "This preview performs simulated HTTP latency and throughput passes. No production measurement endpoints are called.",
} as const;
