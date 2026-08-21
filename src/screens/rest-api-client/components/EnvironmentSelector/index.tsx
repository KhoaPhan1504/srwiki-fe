import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import type { Environment } from '~root/types';

const NO_ENVIRONMENT_VALUE = '__none__';

type Props = {
  environments: Environment[];
  environmentId: string | null;
  onEnvironmentIdChange: (id: string | null) => void;
  onManage: () => void;
};

export const EnvironmentSelector = ({
  environments,
  environmentId,
  onEnvironmentIdChange,
  onManage,
}: Props) => {
  const { t } = useTranslation('rest-api-client');

  return (
    <div className="flex items-center gap-1">
      <Select
        value={environmentId ?? NO_ENVIRONMENT_VALUE}
        onValueChange={(value) =>
          onEnvironmentIdChange(value === NO_ENVIRONMENT_VALUE ? null : value)
        }
      >
        <SelectTrigger className="w-40" aria-label={t('environments.selectorLabel')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_ENVIRONMENT_VALUE}>{t('environments.noEnvironment')}</SelectItem>
          {environments.map((environment) => (
            <SelectItem key={environment.id} value={environment.id}>
              {environment.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onManage}
        aria-label={t('environments.manage')}
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
};
