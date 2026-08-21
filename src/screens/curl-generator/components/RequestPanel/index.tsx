import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolPanel } from '~root/components/tools';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui';
import type { HttpMethod, KeyValuePair } from '~root/types';
import { BodyEditor } from '../BodyEditor';
import { KeyValueEditor } from '../KeyValueEditor';

type Tab = 'params' | 'headers' | 'body';

type Props = {
  method: HttpMethod;
  queryParams: KeyValuePair[];
  onAddQueryParam: () => void;
  onUpdateQueryParam: (id: string, patch: Partial<KeyValuePair>) => void;
  onRemoveQueryParam: (id: string) => void;
  headers: KeyValuePair[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, patch: Partial<KeyValuePair>) => void;
  onRemoveHeader: (id: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
};

export const RequestPanel = ({
  method,
  queryParams,
  onAddQueryParam,
  onUpdateQueryParam,
  onRemoveQueryParam,
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  body,
  onBodyChange,
}: Props) => {
  const { t } = useTranslation('curl-generator');
  const [activeTab, setActiveTab] = useState<Tab>('params');
  const bodyDisabled = method === 'GET';

  return (
    <ToolPanel title={t('request.title')}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
        <TabsList>
          <TabsTrigger value="params">{t('request.tabs.params')}</TabsTrigger>
          <TabsTrigger value="headers">{t('request.tabs.headers')}</TabsTrigger>
          <TabsTrigger value="body" disabled={bodyDisabled}>
            {t('request.tabs.body')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="params">
          <KeyValueEditor
            rows={queryParams}
            onAdd={onAddQueryParam}
            onUpdate={onUpdateQueryParam}
            onRemove={onRemoveQueryParam}
            keyPlaceholder={t('request.params.keyPlaceholder')}
            valuePlaceholder={t('request.params.valuePlaceholder')}
            addLabel={t('request.params.add')}
            removeLabel={t('request.params.remove')}
            enabledLabel={t('request.rowEnabled')}
            emptyLabel={t('request.params.empty')}
          />
        </TabsContent>

        <TabsContent value="headers">
          <KeyValueEditor
            rows={headers}
            onAdd={onAddHeader}
            onUpdate={onUpdateHeader}
            onRemove={onRemoveHeader}
            keyPlaceholder={t('request.headers.keyPlaceholder')}
            valuePlaceholder={t('request.headers.valuePlaceholder')}
            addLabel={t('request.headers.add')}
            removeLabel={t('request.headers.remove')}
            enabledLabel={t('request.rowEnabled')}
            emptyLabel={t('request.headers.empty')}
          />
        </TabsContent>

        <TabsContent value="body">
          <BodyEditor value={body} onChange={onBodyChange} disabled={bodyDisabled} />
        </TabsContent>
      </Tabs>
    </ToolPanel>
  );
};
