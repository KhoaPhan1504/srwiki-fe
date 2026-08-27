import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui/select';
import type { ModelOut } from '~root/apis/useListModels';

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  openai: 'ChatGPT',
  openrouter: 'OpenRouter',
};

type Props = {
  models: ModelOut[];
  value: string | null;
  onChange: (modelId: string) => void;
};

export const ModelSelector = ({ models, value, onChange }: Props) => {
  if (models.length === 0) return null;

  const groups = new Map<string, ModelOut[]>();
  for (const model of models) {
    const list = groups.get(model.provider) ?? [];
    list.push(model);
    groups.set(model.provider, list);
  }

  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="h-8 w-auto shrink-0 gap-1 rounded-full border-0 bg-transparent px-3 text-xs text-muted-foreground shadow-none hover:bg-accent focus-visible:ring-0"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-50!">
        {[...groups.entries()].map(([provider, providerModels]) => (
          <SelectGroup key={provider}>
            <SelectLabel>{PROVIDER_LABELS[provider] ?? provider}</SelectLabel>
            {providerModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};
