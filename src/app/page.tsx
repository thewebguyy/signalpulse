import { Notice } from "@/components/ui/notice";
import { Section } from "@/components/ui/section";
import { CONTRACT_IMPLEMENTATION, CONTRACT_VERSION } from "@/contracts/version";
import { readFoundationPreview } from "@/server/foundation";

export default function FoundationPage() {
  const preview = readFoundationPreview();
  return (
    <main id="main" className="mx-auto max-w-4xl space-y-7 px-5 py-12 sm:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">SignalPulse NG</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A foundation for trustworthy evidence.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-700">An independent platform for documenting mobile-network experiences and supporting informed consumer action.</p>
      </header>
      <Notice title="Local engineering preview">
        <p>{preview.warning} Live authentication, saving, uploads, measurements and public aggregation are not enabled.</p>
      </Notice>
      <div className="grid gap-5 sm:grid-cols-2">
        <Section id="incident" title="Incident Journal boundary">
          <p className="font-semibold text-slate-950">Synthetic incident example</p>
          <p className="mt-2">{preview.incident.fields.narrative}</p>
          <p className="mt-2">Provenance: user-reported. No form collects data in this foundation.</p>
        </Section>
        <Section id="evidence" title="Evidence Builder boundary">
          <p>Shared contracts separate reported incidents, application measurements and attachments. Text-only evidence comes before secure uploads.</p>
        </Section>
        <Section id="intelligence" title="Public intelligence boundary">
          <p>No publishable observations for this cohort.</p>
          <p className="mt-2">Synthetic fixtures never qualify for public metrics.</p>
        </Section>
        <Section id="integration" title="Frontend integration">
          <p>Wire contract {CONTRACT_VERSION}; implementation {CONTRACT_IMPLEMENTATION}.</p>
          <p className="mt-2">Typed schemas, module ports and synthetic fixtures are ready for Antigravity’s contract review.</p>
        </Section>
      </div>
      <footer className="border-t border-slate-200 pt-5 text-sm text-slate-600">Lagos-first scope · MTN · Airtel · Glo · T2mobile</footer>
    </main>
  );
}
