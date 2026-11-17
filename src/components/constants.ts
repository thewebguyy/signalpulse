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
    title: "Call didn't connect",
    description: "The call failed to go through or cut off before ringing.",
    guidance: "Note the time you tried to call and any message or tone you heard.",
  },
  {
    code: "dropped_call",
    title: "Dropped call",
    description: "An ongoing call cut off suddenly without anyone hanging up.",
    guidance: "Note how long the call lasted before it cut off and where you were.",
  },
  {
    code: "unusable_internet",
    title: "Data not working",
    description: "Your mobile data is turned on, but pages, apps, or messages won't load.",
    guidance: "Note whether apps stopped loading completely or timed out.",
  },
  {
    code: "suspicious_data_depletion",
    title: "Data finished too fast",
    description: "Your data bundle ran out much faster than expected for what you used.",
    guidance: "Save your balance SMS, the time window, and what apps you were using.",
  },
  {
    code: "failed_airtime_data_purchase",
    title: "Paid but didn't get airtime or data",
    description: "Money left your bank or wallet for airtime or data, but nothing arrived.",
    guidance: "Keep your bank transaction reference, debit time, and any SMS alerts.",
  },
  {
    code: "billing_dispute",
    title: "Unexpected airtime deduction",
    description: "Airtime was deducted for a service you didn't want or at the wrong rate.",
    guidance: "Note the shortcode, amount deducted, your balance before/after, and any STOP messages sent.",
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
