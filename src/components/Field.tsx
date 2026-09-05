import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl bg-glass px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border backdrop-blur-md placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/60";
