import { useState } from 'react';
import { MoreVertical, Plus } from 'lucide-react';
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
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~root/components/ui';
import type { Environment, KeyValuePair } from '~root/types';
import { createEmptyKeyValuePair } from '~root/utils';
import { KeyValueEditor } from '../KeyValueEditor';
import { RenamePromptDialog } from '../RenamePromptDialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environments: Environment[];
  globalVariables: KeyValuePair[];
  onCreateEnvironment: (name: string) => void;
  onRenameEnvironment: (id: string, name: string) => void;
  onDeleteEnvironment: (id: string) => void;
  onSaveEnvironmentVariables: (id: string, variables: KeyValuePair[]) => void;
  onSaveGlobalVariables: (variables: KeyValuePair[]) => void;
};

type ManagerTab = 'globals' | 'environments';

const VariablesEditorPane = ({
  variables,
  onSave,
}: {
  variables: KeyValuePair[];
  onSave: (variables: KeyValuePair[]) => void;
}) => {
  const { t } = useTranslation('rest-api-client');
  const [rows, setRows] = useState<KeyValuePair[]>(
    variables.length > 0 ? variables : [createEmptyKeyValuePair()],
  );

  return (
    <div className="space-y-4">
      <KeyValueEditor
        rows={rows}
        onAdd={() => setRows((prev) => [...prev, createEmptyKeyValuePair()])}
        onUpdate={(id, patch) =>
          setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
        }
        onRemove={(id) => setRows((prev) => prev.filter((row) => row.id !== id))}
        keyPlaceholder={t('environments.variables.keyPlaceholder')}
        valuePlaceholder={t('environments.variables.valuePlaceholder')}
        addLabel={t('environments.variables.add')}
        removeLabel={t('environments.variables.remove')}
        enabledLabel={t('request.rowEnabled')}
        emptyLabel={t('environments.variables.empty')}
      />
      <Button type="button" onClick={() => onSave(rows)}>
        {t('actions.save')}
      </Button>
    </div>
  );
};

export const EnvironmentManagerDialog = ({
  open,
  onOpenChange,
  environments,
  globalVariables,
  onCreateEnvironment,
  onRenameEnvironment,
  onDeleteEnvironment,
  onSaveEnvironmentVariables,
  onSaveGlobalVariables,
}: Props) => {
  const { t } = useTranslation('rest-api-client');
  const [tab, setTab] = useState<ManagerTab>('globals');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(
    environments[0]?.id ?? null,
  );
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const selectedEnvironment = environments.find((env) => env.id === selectedEnvironmentId) ?? null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('environments.manager.title')}</DialogTitle>
          </DialogHeader>
          <Tabs value={tab} onValueChange={(value) => setTab(value as ManagerTab)}>
            <TabsList>
              <TabsTrigger value="globals">{t('environments.manager.globalsTab')}</TabsTrigger>
              <TabsTrigger value="environments">
                {t('environments.manager.environmentsTab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="globals">
              <VariablesEditorPane
                key="globals"
                variables={globalVariables}
                onSave={onSaveGlobalVariables}
              />
            </TabsContent>

            <TabsContent value="environments">
              <div className="flex gap-4">
                <div className="w-40 shrink-0 space-y-1">
                  {environments.map((environment) => (
                    <div key={environment.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        className="flex-1 truncate text-left text-sm"
                        onClick={() => setSelectedEnvironmentId(environment.id)}
                      >
                        {environment.name}
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
                              setRenameTarget({ id: environment.id, name: environment.name })
                            }
                          >
                            {t('environments.manager.menu.rename')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setDeleteTargetId(environment.id)}>
                            {t('environments.manager.menu.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreating(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t('environments.manager.newEnvironment')}
                  </Button>
                </div>
                <div className="flex-1">
                  {selectedEnvironment ? (
                    <VariablesEditorPane
                      key={selectedEnvironment.id}
                      variables={selectedEnvironment.variables}
                      onSave={(vars) => onSaveEnvironmentVariables(selectedEnvironment.id, vars)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('environments.manager.noneSelected')}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <RenamePromptDialog
        open={renameTarget !== null}
        onOpenChange={(nextOpen) => !nextOpen && setRenameTarget(null)}
        title={t('environments.manager.menu.rename')}
        initialValue={renameTarget?.name ?? ''}
        onSubmit={(value) => {
          if (renameTarget) onRenameEnvironment(renameTarget.id, value);
          setRenameTarget(null);
        }}
      />

      <RenamePromptDialog
        open={creating}
        onOpenChange={setCreating}
        title={t('environments.manager.newEnvironment')}
        initialValue=""
        onSubmit={(value) => {
          onCreateEnvironment(value);
          setCreating(false);
        }}
      />

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('collections.deleteRequestConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('collections.deleteRequestConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTargetId) onDeleteEnvironment(deleteTargetId);
                setDeleteTargetId(null);
              }}
            >
              {t('environments.manager.menu.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
