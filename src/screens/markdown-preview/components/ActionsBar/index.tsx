import { Download, FileCode2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '~root/components/ui';
import { CopyButton } from '~root/components/tools';
import { buildStandaloneHtmlDocument } from '~root/utils';

type Props = {
  markdown: string;
  html: string;
  onClear: () => void;
};

const downloadBlob = (content: string, mimeType: string, filename: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const ActionsBar = ({ markdown, html, onClear }: Props) => {
  const { t } = useTranslation('markdown-preview');
  const hasContent = Boolean(markdown);

  const handleDownloadMarkdown = () => {
    downloadBlob(markdown, 'text/markdown', 'document.md');
  };

  const handleDownloadHtml = () => {
    const htmlDocument = buildStandaloneHtmlDocument(html, t('title'));
    downloadBlob(htmlDocument, 'text/html', 'document.html');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton
        value={markdown}
        label={t('actions.copy')}
        copiedLabel={t('actions.copied')}
        errorMessage={t('actions.copyError')}
        disabled={!hasContent}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownloadMarkdown}
        disabled={!hasContent}
      >
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        {t('actions.downloadMarkdown')}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownloadHtml}
        disabled={!hasContent}
      >
        <FileCode2 className="mr-2 h-4 w-4" aria-hidden="true" />
        {t('actions.downloadHtml')}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={!hasContent}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('actions.clear')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.clearConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.clearConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onClear}>
              {t('actions.clear')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
