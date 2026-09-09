import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NeoCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("neo-card p-4", className)}>{children}</div>;
}

type NeoButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "danger" | "warning" | "info" | "neutral" | "dark";
  size?: "sm" | "md" | "lg";
};

const toneClass: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-destructive-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
  neutral: "bg-card text-card-foreground",
  dark: "bg-foreground text-background",
};

const sizeClass: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-base",
};

export function NeoButton({ tone = "primary", size = "md", className, ...props }: NeoButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "neo-press inline-flex items-center justify-center gap-2 rounded-md border-[3px] border-ink font-display font-bold uppercase tracking-tight shadow-neo disabled:cursor-not-allowed disabled:opacity-50",
        toneClass[tone],
        sizeClass[size],
        className,
      )}
    />
  );
}

export function NeoBadge({
  tone = "neutral",
  children,
}: {
  tone?: "primary" | "danger" | "warning" | "info" | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border-2 border-ink px-2 py-0.5 font-display text-[11px] font-bold uppercase shadow-neo-sm",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export function NeoInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border-[3px] border-ink bg-card px-3 py-2.5 text-sm font-medium text-card-foreground shadow-neo-sm outline-none placeholder:text-muted-foreground focus:shadow-neo",
        className,
      )}
    />
  );
}

export function NeoTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-md border-[3px] border-ink bg-card px-3 py-2.5 text-sm font-medium text-card-foreground shadow-neo-sm outline-none placeholder:text-muted-foreground focus:shadow-neo",
        className,
      )}
    />
  );
}

export function NeoSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-md border-[3px] border-ink bg-card px-3 py-2.5 text-sm font-bold text-card-foreground shadow-neo-sm outline-none",
        className,
      )}
    />
  );
}

export function NeoLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wide">
      {children}
    </label>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="neo-heading text-2xl sm:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border-[3px] border-dashed border-ink/40 p-8 text-center font-display text-sm font-bold uppercase text-muted-foreground">
      {text}
    </div>
  );
}

export function formatRp(value: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value ?? 0);
}
