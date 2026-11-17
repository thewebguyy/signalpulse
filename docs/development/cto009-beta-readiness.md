# SignalPulse NG — Beta Readiness: Privacy-Respecting Analytics & User-Test Plan (CTO009)

> **Status:** Proposed for Future Approved Beta (Telemetry Disabled; Recruitment Not Started)  
> **Scope:** Synthetic-Only Consumer Experience (`v3`)  
> **Invariants:** Zero PII, zero third-party tracking pixels, zero unconsented data collection  

---

## 1. Minimal Privacy-Respecting Event Taxonomy (Inactive Until Approved)

No third-party analytics or telemetry are active in the current release. When a future controlled beta is explicitly approved, only coarse, non-identifying product-health counters should be recorded:

| Event Name | Allowed Properties | Explicitly Excluded |
| :--- | :--- | :--- |
| `home_primary_action_chosen` | `target` (`report_problem` \| `view_records` \| `network_check`) | IP, user-agent, device fingerprint, referrer URL |
| `incident_form_started` | `route` (`/incidents`) | Selected operator, area, narrative text |
| `incident_saved` | `category` (enum), `has_ticket_ref` (boolean) | Narrative text, ticket ID, timestamp precision beyond day, LGA |
| `incident_save_failed` | `error_code` (`storage_unavailable` \| `quota_exceeded` \| `validation_error` \| `write_failed`) | Stack traces, entered form text |
| `complaint_prep_started` | `saved_record_count_bucket` (`0` \| `1-3` \| `4+`) | Record IDs, narratives |
| `evidence_export_completed` | `format` (`json` \| `print`), `record_count_bucket` (`1` \| `2-5` \| `6+`) | Exported JSON contents, file names, complaint statement |

### Data Minimization Rules
1. **No Identifiers:** Never attach session IDs, user IDs, cookies, IP addresses, or browser fingerprints to product events.
2. **Coarse Aggregation Only:** Store daily aggregate counts; do not log raw event timelines per visitor.
3. **Consent & Opt-Out:** Provide a plain-language disclosure and opt-out before enabling any beta telemetry.

---

## 2. Controlled 5-Participant Usability Test Plan (Not Yet Active)

**Target Participants:** 5 Lagos mobile subscribers (mix of entry-level Android and iPhone users, including prepaid data users and voice-call users).  
**Environment:** Protected preview URL (`signalpulse-nine.vercel.app`) accessed under supervision with a facilitator-provided test session; no real personal phone numbers, bank details, or private screenshots entered.  
**Pre-Condition:** Written privacy notice and testing consent approved before recruiting or collecting feedback.

### Core Scenarios
1. **Lagos Student (Dead Data):** Your mobile data is on, but WhatsApp and browsing stopped working in Yaba. Use the app to see if you can test your connection and record what happened.
2. **Worker Debited Without Credit (Primary Journey):** You paid ₦2,000 for an MTN data bundle, your bank debited you, but you received no data. Record the problem, reload the page to check it stayed saved, edit it to add a ticket number, and prepare a complaint file/PDF.
3. **Recurring Dropped Calls:** You have had three dropped calls this week and want to know how to complain to your network and escalate to the NCC.

### Facilitator Script & Evaluation Criteria

| Dimension | Questions / Observation Prompts | Success Criteria |
| :--- | :--- | :--- |
| **1. First-Impression Comprehension** | *"In your own words, what does this app do?"* | Participant understands it helps record network problems and prepare complaints (not a speed-test app) within 15 seconds. |
| **2. Honest Capability Understanding** | *"Can you test your internet speed here right now?"* | Participant immediately sees *"Connection testing isn't available yet"* and moves to *"Report a problem"* without confusion. |
| **3. Incident Report Completion** | Complete Scenario 2 from `/` to `"Save report"`. | ≥ 4/5 participants complete without facilitator help, ≤ 6 taps/clicks, no validation dead-ends. |
| **4. Local Storage Understanding** | *"Where is this report saved? What happens if you switch phones?"* | Participant understands reports stay on their current browser/device only and are not synced to the cloud. |
| **5. Complaint Preparation** | Select the saved report, edit the complaint note, and download JSON or open Print/Save PDF. | ≥ 4/5 participants locate `"Prepare a Complaint"`, select a record, and trigger export without errors. |
| **6. Consumer Trust** | *"Does SignalPulse guarantee your network will refund you?"* | Participant understands SignalPulse is an independent record-keeping tool and that `300` (network) / `622` (NCC) handle resolution. |

### Stop-Loss / Privacy Rules for Testing
- Do not ask participants to enter real phone numbers, bank references, or personal addresses during the test.
- Clear browser `localStorage` on any shared test device immediately after each session.
