import { useState, type KeyboardEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';
import { FormField, Input, Badge } from '~root/components/ui';
import { FieldShell } from '~root/components/common';
import type { SrMultipleSearchKeywordsFieldProps } from '~root/components/ui/form/InputGroup/types';

export const SrMultipleSearchKeywordsField = ({
  name,
  label,
  description,
  placeholder,
  disabled,
  maxKeywords,
}: SrMultipleSearchKeywordsFieldProps) => {
  const { control } = useFormContext();
  const [draft, setDraft] = useState('');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const keywords: string[] = Array.isArray(field.value) ? field.value : [];

        const addKeyword = () => {
          const value = draft.trim();
          if (!value || keywords.includes(value)) return;
          if (maxKeywords && keywords.length >= maxKeywords) return;
          field.onChange([...keywords, value]);
          setDraft('');
        };

        const removeKeyword = (value: string) => {
          field.onChange(keywords.filter((k) => k !== value));
        };

        const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addKeyword();
          }
        };

        return (
          <FieldShell label={label} description={description}>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => !disabled && removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                value={draft}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={addKeyword}
              />
            </div>
          </FieldShell>
        );
      }}
    />
  );
};
