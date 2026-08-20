import { Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '~root/components/ui';
import { validateMarkdownUploadFile } from '~root/utils';
import { UPLOAD_ERROR_KEY } from '~root/constants';
import type { ApplyToolbarActionResult, ToolbarAction } from '~root/types';
import { Toolbar } from '../Toolbar';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onFileLoaded: (content: string) => void;
  onToolbarAction: (
    action: ToolbarAction,
    selectionStart: number,
    selectionEnd: number,
  ) => ApplyToolbarActionResult;
};

export const EditorPanel = ({ value, onChange, onFileLoaded, onToolbarAction }: Props) => {
  const { t } = useTranslation('markdown-preview');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const pending = pendingSelectionRef.current;
    const textarea = textareaRef.current;
    if (!pending || !textarea) return;
    pendingSelectionRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(pending.start, pending.end);
  }, [value]);

  const runToolbarAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? value.length;
    const selectionEnd = textarea?.selectionEnd ?? value.length;
    const result = onToolbarAction(action, selectionStart, selectionEnd);
    pendingSelectionRef.current = { start: result.selectionStart, end: result.selectionEnd };
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextValue = `${value.slice(0, start)}  ${value.slice(end)}`;
      pendingSelectionRef.current = { start: start + 2, end: start + 2 };
      onChange(nextValue);
      return;
    }

    const isModifierPressed = event.metaKey || event.ctrlKey;
    if (isModifierPressed && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      runToolbarAction('bold');
      return;
    }
    if (isModifierPressed && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      runToolbarAction('italic');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateMarkdownUploadFile(file);
    if (!validation.valid) {
      toast.error(t(UPLOAD_ERROR_KEY[validation.reason]), { position: 'bottom-center' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileLoaded(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      toast.error(t('input.uploadReadError'), { position: 'bottom-center' });
    };
    reader.readAsText(file);
  };

  const lineCount = value.split('\n').length;

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2 space-y-0">
        <CardTitle className="text-sm font-medium">{t('input.title')}</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{t('input.charCount', { count: value.length })}</span>
          <span>{t('input.lineCount', { count: lineCount })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Toolbar onAction={runToolbarAction} />
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,text/markdown"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('input.upload')}
            </Button>
          </div>
        </div>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('input.placeholder')}
          spellCheck={false}
          aria-label={t('input.title')}
          className="h-96 resize-none font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
};
