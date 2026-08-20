import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const ToolHeader = ({ title, description, icon: Icon }: Props) => (
  <div className="flex items-center gap-3">
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: 'color-mix(in oklch, var(--dashboard-accent) 15%, transparent)' }}
    >
      <Icon className="h-5 w-5" style={{ color: 'var(--dashboard-accent)' }} aria-hidden="true" />
    </span>
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);
