import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';

type Props = {
  html: string;
};

export const PreviewPanel = ({ html }: Props) => {
  const { t } = useTranslation('markdown-preview');

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('preview.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {html ? (
          <div
            className="prose prose-sm dark:prose-invert h-96 max-w-none overflow-auto rounded-md border bg-background p-4 [&_.md-code-block]:overflow-hidden [&_.md-code-block]:rounded-md [&_.md-code-block]:border [&_.md-code-block]:not-prose [&_.md-code-block>pre]:m-0 [&_.md-code-block>pre]:rounded-none [&_.md-code-block::before]:block [&_.md-code-block::before]:bg-muted [&_.md-code-block::before]:px-3 [&_.md-code-block::before]:py-1 [&_.md-code-block::before]:text-xs [&_.md-code-block::before]:text-muted-foreground [&_.md-code-block::before]:content-[attr(data-language)]"
            // `html` comes from renderMarkdownToSafeHtml, which runs DOMPurify before this ever reaches the DOM.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 opacity-50" aria-hidden="true" />
            <p>{t('preview.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
