import React from "react";
import type { LucideIcon } from "lucide-react";

export type LabTone = "accent" | "safe" | "danger";

export const toneStyles: Record<
  LabTone,
  { text: string; bg: string; border: string; ring: string; solid: string }
> = {
  accent: {
    text: "text-mozi-accent",
    bg: "bg-mozi-accent/10",
    border: "border-mozi-accent/30",
    ring: "ring-mozi-accent",
    solid: "bg-mozi-accent",
  },
  safe: {
    text: "text-mozi-safe",
    bg: "bg-mozi-safe/10",
    border: "border-mozi-safe/30",
    ring: "ring-mozi-safe",
    solid: "bg-mozi-safe",
  },
  danger: {
    text: "text-mozi-danger",
    bg: "bg-mozi-danger/10",
    border: "border-mozi-danger/30",
    ring: "ring-mozi-danger",
    solid: "bg-mozi-danger",
  },
};

interface LabHeroProps {
  badge: string;
  title: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  tone: LabTone;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}

export const LabHero: React.FC<LabHeroProps> = ({
  badge,
  title,
  description,
  icon: Icon,
  tone,
  meta,
  children,
}) => {
  const t = toneStyles[tone];
  return (
    <div className="flex flex-col gap-5 border-b border-mozi-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${t.border} ${t.bg}`}
          >
            <Icon className={`h-5 w-5 ${t.text}`} />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-mozi-text-muted">
            {badge}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-mozi-text md:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-mozi-text-muted">
          {description}
        </p>
        {children}
      </div>
      {meta && <div className="shrink-0">{meta}</div>}
    </div>
  );
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  children,
  className = "",
  padded = true,
}) => (
  <div
    className={`rounded-2xl border border-mozi-border bg-mozi-dark shadow-lg ${padded ? "p-4" : ""} ${className}`}
  >
    {children}
  </div>
);

interface PanelHeaderProps {
  icon?: LucideIcon;
  title: string;
  accent?: string;
  extra?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon: Icon,
  title,
  accent = "text-mozi-accent",
  extra,
}) => (
  <div className="mb-4 flex items-center justify-between gap-3 border-b border-mozi-border pb-3">
    <div className="flex items-center gap-2.5">
      {Icon && <Icon className={`h-4 w-4 ${accent}`} />}
      <h3 className="text-xs font-bold uppercase tracking-widest text-mozi-text">
        {title}
      </h3>
    </div>
    {extra}
  </div>
);

interface FieldLabelProps {
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({
  icon: Icon,
  children,
}) => (
  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-mozi-text-muted">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </div>
);
