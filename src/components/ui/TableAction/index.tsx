import { useState } from 'react';
import { MoreVertical, type LucideIcon } from 'lucide-react';
import { Button } from '~root/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~root/components/ui/alert-dialog';

export type TableActionItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  confirm?: {
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
  };
};

type TableActionProps = {
  items: TableActionItem[];
  triggerLabel: string;
};

export function TableAction({ items, triggerLabel }: TableActionProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const pendingItem = items.find((item) => item.key === pendingKey) ?? null;

  const handleSelect = (item: TableActionItem) => {
    if (item.confirm) {
      setPendingKey(item.key);
    } else {
      item.onSelect();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={triggerLabel}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.key}
              variant={item.variant}
              disabled={item.disabled}
              onSelect={() => handleSelect(item)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={pendingItem !== null}
        onOpenChange={(open) => !open && setPendingKey(null)}
      >
        <AlertDialogContent>
          {pendingItem?.confirm && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{pendingItem.confirm.title}</AlertDialogTitle>
                <AlertDialogDescription>{pendingItem.confirm.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{pendingItem.confirm.cancelLabel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    pendingItem.onSelect();
                    setPendingKey(null);
                  }}
                >
                  {pendingItem.confirm.confirmLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
