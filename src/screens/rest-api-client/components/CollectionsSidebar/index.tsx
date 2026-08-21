import { useState } from 'react';
import { ChevronRight, MoreVertical, Plus } from 'lucide-react';
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
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~root/components/ui';
import { cn } from '~root/lib/utils';
import type { Collection, SavedRequest } from '~root/types';
import { RenamePromptDialog } from '../RenamePromptDialog';

type Props = {
  collections: Collection[];
  isLoading: boolean;
  loadedRequestId: string | null;
  onSelectRequest: (request: SavedRequest) => void;
  onCreateCollection: (name: string) => void;
  onRenameCollection: (id: string, name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameRequest: (id: string, name: string) => void;
  onDeleteRequest: (id: string) => void;
};

type RenameTarget = { kind: 'collection' | 'request'; id: string; name: string } | null;
type DeleteTarget = { kind: 'collection' | 'request'; id: string } | null;

export const CollectionsSidebar = ({
  collections,
  isLoading,
  loadedRequestId,
  onSelectRequest,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onRenameRequest,
  onDeleteRequest,
}: Props) => {
  const { t } = useTranslation('rest-api-client');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [renameTarget, setRenameTarget] = useState<RenameTarget>(null);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRenameSubmit = (value: string) => {
    if (!renameTarget) return;
    if (renameTarget.kind === 'collection') onRenameCollection(renameTarget.id, value);
    else onRenameRequest(renameTarget.id, value);
    setRenameTarget(null);
  };

  const handleCreateCollectionSubmit = (value: string) => {
    onCreateCollection(value);
    setCreatingCollection(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'collection') onDeleteCollection(deleteTarget.id);
    else onDeleteRequest(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="w-full space-y-2 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t('collections.title')}</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCreatingCollection(true)}
          aria-label={t('collections.newCollection')}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">...</p>}
      {!isLoading && collections.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('collections.empty')}</p>
      )}

      {collections.map((collection) => (
        <div key={collection.id}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex flex-1 items-center gap-1 truncate text-left text-sm font-medium"
              onClick={() => toggleExpanded(collection.id)}
            >
              <ChevronRight
                className={cn('h-4 w-4 shrink-0 transition-transform', {
                  'rotate-90': expanded.has(collection.id),
                })}
                aria-hidden="true"
              />
              {collection.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="menu">
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() =>
                    setRenameTarget({
                      kind: 'collection',
                      id: collection.id,
                      name: collection.name,
                    })
                  }
                >
                  {t('collections.menu.rename')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setDeleteTarget({ kind: 'collection', id: collection.id })}
                >
                  {t('collections.menu.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {expanded.has(collection.id) && (
            <div className="ml-5 space-y-1 border-l pl-2">
              {collection.requests.map((request) => (
                <div key={request.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    className={cn(
                      'flex flex-1 items-center gap-2 truncate rounded px-1 py-1 text-left text-sm',
                      request.id === loadedRequestId && 'bg-accent',
                    )}
                    onClick={() => onSelectRequest(request)}
                  >
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {request.method}
                    </Badge>
                    <span className="truncate">{request.name}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="menu">
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onSelect={() =>
                          setRenameTarget({ kind: 'request', id: request.id, name: request.name })
                        }
                      >
                        {t('collections.menu.rename')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setDeleteTarget({ kind: 'request', id: request.id })}
                      >
                        {t('collections.menu.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <RenamePromptDialog
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title={t('collections.menu.rename')}
        initialValue={renameTarget?.name ?? ''}
        onSubmit={handleRenameSubmit}
      />

      <RenamePromptDialog
        open={creatingCollection}
        onOpenChange={setCreatingCollection}
        title={t('collections.newCollection')}
        initialValue=""
        onSubmit={handleCreateCollectionSubmit}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.kind === 'collection'
                ? t('collections.deleteCollectionConfirmTitle')
                : t('collections.deleteRequestConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.kind === 'collection'
                ? t('collections.deleteCollectionConfirmDescription')
                : t('collections.deleteRequestConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              {t('collections.menu.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
