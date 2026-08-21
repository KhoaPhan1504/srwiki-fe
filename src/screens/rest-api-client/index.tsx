import { useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolHeader } from '~root/components/tools';
import {
  useCreateCollection,
  useCreateEnvironment,
  useDeleteCollection,
  useDeleteEnvironment,
  useDeleteSavedRequest,
  useGetCollections,
  useGetEnvironments,
  useGetGlobalVariables,
  useRenameCollection,
  useUpdateEnvironment,
  useUpdateGlobalVariables,
  useUpdateSavedRequest,
} from '~root/apis';
import { mergeVariables } from '~root/utils';
import {
  CollectionsSidebar,
  EnvironmentManagerDialog,
  MethodUrlBar,
  RequestPanel,
  ResponsePanel,
  SaveRequestDialog,
} from './components';
import { useRestApiClientHooks } from './hooks';

export const RestApiClientScreen = () => {
  const { t } = useTranslation('rest-api-client');
  const {
    method,
    setMethod,
    url,
    setUrl,
    queryParams,
    addQueryParam,
    updateQueryParam,
    removeQueryParam,
    headers,
    addHeader,
    updateHeader,
    removeHeader,
    body,
    setBody,
    bodyType,
    setBodyType,
    bodyFields,
    addBodyField,
    updateBodyField,
    removeBodyField,
    auth,
    setAuth,
    loadedRequestId,
    loadSavedRequest,
    environmentId,
    setEnvironmentId,
    status,
    response,
    error,
    handleSend,
    handleCancel,
    handleClear,
  } = useRestApiClientHooks();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [environmentManagerOpen, setEnvironmentManagerOpen] = useState(false);
  const { collections, isLoading: isLoadingCollections } = useGetCollections();
  const { mutate: createCollection } = useCreateCollection();
  const { mutate: renameCollection } = useRenameCollection();
  const { mutate: deleteCollection } = useDeleteCollection();
  const { mutate: updateSavedRequest } = useUpdateSavedRequest();
  const { mutate: deleteSavedRequest } = useDeleteSavedRequest();

  const { environments } = useGetEnvironments();
  const { variables: globalVariables } = useGetGlobalVariables();
  const { mutate: createEnvironment } = useCreateEnvironment();
  const { mutate: updateEnvironment } = useUpdateEnvironment();
  const { mutate: deleteEnvironment } = useDeleteEnvironment();
  const { mutate: updateGlobalVariables } = useUpdateGlobalVariables();

  const requestState = { method, url, queryParams, headers, body, bodyType, bodyFields, auth };
  const activeEnvironment = environments.find((env) => env.id === environmentId) ?? null;
  const mergedVariables = mergeVariables(globalVariables, activeEnvironment?.variables ?? []);

  const handleSave = () => {
    if (loadedRequestId) {
      updateSavedRequest({ id: loadedRequestId, ...requestState });
    } else {
      setSaveDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <ToolHeader title={t('title')} description={t('description')} icon={Send} />

      <MethodUrlBar
        method={method}
        onMethodChange={setMethod}
        url={url}
        onUrlChange={setUrl}
        status={status}
        onSend={() => handleSend(mergedVariables)}
        onCancel={handleCancel}
        onClear={handleClear}
        onSave={handleSave}
        environments={environments}
        environmentId={environmentId}
        onEnvironmentIdChange={setEnvironmentId}
        onManageEnvironments={() => setEnvironmentManagerOpen(true)}
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        <CollectionsSidebar
          collections={collections}
          isLoading={isLoadingCollections}
          loadedRequestId={loadedRequestId}
          onSelectRequest={loadSavedRequest}
          onCreateCollection={(name) => createCollection({ name })}
          onRenameCollection={(id, name) => renameCollection({ id, name })}
          onDeleteCollection={deleteCollection}
          onRenameRequest={(id, name) => updateSavedRequest({ id, name })}
          onDeleteRequest={deleteSavedRequest}
        />

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <RequestPanel
            method={method}
            queryParams={queryParams}
            onAddQueryParam={addQueryParam}
            onUpdateQueryParam={updateQueryParam}
            onRemoveQueryParam={removeQueryParam}
            headers={headers}
            onAddHeader={addHeader}
            onUpdateHeader={updateHeader}
            onRemoveHeader={removeHeader}
            body={body}
            onBodyChange={setBody}
            bodyType={bodyType}
            onBodyTypeChange={setBodyType}
            bodyFields={bodyFields}
            onAddBodyField={addBodyField}
            onUpdateBodyField={updateBodyField}
            onRemoveBodyField={removeBodyField}
            auth={auth}
            onAuthChange={setAuth}
          />
          <ResponsePanel status={status} response={response} error={error} />
        </div>
      </div>

      <SaveRequestDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        collections={collections}
        requestState={requestState}
        onSaved={loadSavedRequest}
      />

      <EnvironmentManagerDialog
        open={environmentManagerOpen}
        onOpenChange={setEnvironmentManagerOpen}
        environments={environments}
        globalVariables={globalVariables}
        onCreateEnvironment={(name) => createEnvironment({ name })}
        onRenameEnvironment={(id, name) => updateEnvironment({ id, name })}
        onDeleteEnvironment={deleteEnvironment}
        onSaveEnvironmentVariables={(id, variables) => updateEnvironment({ id, variables })}
        onSaveGlobalVariables={updateGlobalVariables}
      />
    </div>
  );
};
