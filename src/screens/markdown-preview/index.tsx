import { NotebookText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolHeader } from '~root/components/tools';
import { cn } from '~root/lib/utils';
import { ActionsBar, EditorPanel, ExamplesPanel, PreviewPanel, ViewModeToggle } from './components';
import { useMarkdownPreview } from './hooks';

export const MarkdownPreviewScreen = () => {
  const { t } = useTranslation('markdown-preview');
  const {
    markdown,
    setMarkdown,
    viewMode,
    setViewMode,
    html,
    handleToolbarAction,
    handleFileLoaded,
    loadExample,
    handleClear,
  } = useMarkdownPreview();

  const showEditor = viewMode === 'editor' || viewMode === 'split';
  const showPreview = viewMode === 'preview' || viewMode === 'split';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToolHeader title={t('title')} description={t('description')} icon={NotebookText} />
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      <ExamplesPanel onSelectExample={loadExample} />

      <div
        className={cn(
          'grid gap-4',
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {showEditor && (
          <EditorPanel
            value={markdown}
            onChange={setMarkdown}
            onFileLoaded={handleFileLoaded}
            onToolbarAction={handleToolbarAction}
          />
        )}
        {showPreview && <PreviewPanel html={html} />}
      </div>

      <ActionsBar markdown={markdown} html={html} onClear={handleClear} />
    </div>
  );
};
