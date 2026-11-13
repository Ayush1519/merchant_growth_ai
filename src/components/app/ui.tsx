import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
        <h1 className="mt-1 text-balance text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Pill({ tone = "primary", children }: { tone?: "primary" | "warn" | "danger" | "neutral" | "info"; children: ReactNode }) {
  const map = {
    primary: "bg-accent text-accent-foreground",
    warn: "bg-warning/15 text-destructive",
    danger: "bg-destructive/12 text-destructive",
    neutral: "bg-ink/5 text-muted-foreground",
    info: "bg-secondary/12 text-secondary",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", map[tone])}>{children}</span>;
}

export function Btn({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "ink" }) {
  const v = {
    primary: "bg-primary text-primary-foreground ring-1 ring-primary",
    ghost: "bg-popover text-card-foreground ring-1 ring-input",
    ink: "bg-ink text-primary-foreground",
  };
  return <button {...p} className={cn("inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50", v[variant], className)} />;
}

export function SectionTitle({ title, hint, right }: { title: string; hint?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div><h2 className="text-lg font-semibold">{title}</h2>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
      {right}
    </div>
  );
}
