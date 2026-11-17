import type { ReactNode } from "react";

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </aside>
  );
}
