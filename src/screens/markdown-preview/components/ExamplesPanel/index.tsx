import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~root/components/ui';
import { ToolPanel } from '~root/components/tools';
import type { MarkdownExample } from '~root/types';
import { MARKDOWN_EXAMPLES } from '~root/constants';

type Props = {
  onSelectExample: (example: MarkdownExample) => void;
};

export const ExamplesPanel = ({ onSelectExample }: Props) => {
  const { t } = useTranslation('markdown-preview');

  const handleValueChange = (id: string) => {
    const example = MARKDOWN_EXAMPLES.find((item) => item.id === id);
    if (example) onSelectExample(example);
  };

  return (
    <ToolPanel title={t('examples.title')}>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full sm:w-64" aria-label={t('examples.selectLabel')}>
          <SelectValue placeholder={t('examples.selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {MARKDOWN_EXAMPLES.map((example) => (
            <SelectItem key={example.id} value={example.id}>
              {t(example.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ToolPanel>
  );
};
