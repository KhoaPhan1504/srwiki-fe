import { Check, Loader2, Wrench } from 'lucide-react';

type Props = {
  toolName: string;
  toolInput: unknown;
  result?: unknown;
};

export const ToolCallChip = ({ toolName, toolInput, result }: Props) => (
  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
    <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    <span className="truncate">
      {toolName}({JSON.stringify(toolInput)})
    </span>
    {result !== undefined ? (
      <Check
        className="h-3.5 w-3.5 shrink-0 text-emerald-600"
        aria-hidden="true"
        data-testid="tool-call-done"
      />
    ) : (
      <Loader2
        className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
        aria-hidden="true"
        data-testid="tool-call-pending"
      />
    )}
  </div>
);
