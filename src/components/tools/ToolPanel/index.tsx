import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import { cn } from '~root/lib/utils';

type Props = {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const ToolPanel = ({ title, headerActions, children, className }: Props) => (
  <Card className={cn('rounded-2xl shadow-[var(--dashboard-card-shadow)]', className)}>
    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
