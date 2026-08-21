import { Plus, Trash2 } from 'lucide-react';
import { Button, Checkbox, Input } from '~root/components/ui';
import type { KeyValuePair } from '~root/types';

type Props = {
  rows: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<KeyValuePair>) => void;
  onRemove: (id: string) => void;
  keyPlaceholder: string;
  valuePlaceholder: string;
  addLabel: string;
  removeLabel: string;
  enabledLabel: string;
  emptyLabel: string;
};

export const KeyValueEditor = ({
  rows,
  onAdd,
  onUpdate,
  onRemove,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
  removeLabel,
  enabledLabel,
  emptyLabel,
}: Props) => (
  <div className="space-y-2">
    {rows.length === 0 && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}

    {rows.map((row) => (
      <div key={row.id} className="flex items-center gap-2">
        <Checkbox
          checked={row.enabled}
          onCheckedChange={(checked) => onUpdate(row.id, { enabled: checked === true })}
          aria-label={enabledLabel}
        />
        <Input
          value={row.key}
          onChange={(event) => onUpdate(row.id, { key: event.target.value })}
          placeholder={keyPlaceholder}
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-sm"
        />
        <Input
          value={row.value}
          onChange={(event) => onUpdate(row.id, { value: event.target.value })}
          placeholder={valuePlaceholder}
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(row.id)}
          aria-label={removeLabel}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    ))}

    <Button type="button" variant="outline" size="sm" onClick={onAdd}>
      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
      {addLabel}
    </Button>
  </div>
);
