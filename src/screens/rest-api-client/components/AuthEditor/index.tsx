import { useTranslation } from 'react-i18next';
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';
import { AUTH_TYPES } from '~root/constants';
import type { AuthConfig } from '~root/types';

type Props = {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
};

const emptyAuthFor = (type: AuthConfig['type']): AuthConfig => {
  switch (type) {
    case 'none':
      return { type: 'none' };
    case 'bearer':
      return { type: 'bearer', token: '' };
    case 'basic':
      return { type: 'basic', username: '', password: '' };
    case 'apiKey':
      return { type: 'apiKey', key: '', value: '', addTo: 'header' };
  }
};

export const AuthEditor = ({ auth, onChange }: Props) => {
  const { t } = useTranslation('rest-api-client');

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="rest-api-client-auth-type">{t('request.auth.typeLabel')}</Label>
        <Select
          value={auth.type}
          onValueChange={(value) => onChange(emptyAuthFor(value as AuthConfig['type']))}
        >
          <SelectTrigger id="rest-api-client-auth-type" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUTH_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`request.auth.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {auth.type === 'none' && (
        <p className="text-sm text-muted-foreground">{t('request.auth.none.description')}</p>
      )}

      {auth.type === 'bearer' && (
        <div className="space-y-1.5">
          <Label htmlFor="rest-api-client-auth-token">{t('request.auth.bearer.tokenLabel')}</Label>
          <Input
            id="rest-api-client-auth-token"
            value={auth.token}
            onChange={(event) => onChange({ type: 'bearer', token: event.target.value })}
            placeholder={t('request.auth.bearer.tokenPlaceholder')}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-sm"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rest-api-client-auth-username">
              {t('request.auth.basic.usernameLabel')}
            </Label>
            <Input
              id="rest-api-client-auth-username"
              value={auth.username}
              onChange={(event) => onChange({ ...auth, username: event.target.value })}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rest-api-client-auth-password">
              {t('request.auth.basic.passwordLabel')}
            </Label>
            <Input
              id="rest-api-client-auth-password"
              type="password"
              value={auth.password}
              onChange={(event) => onChange({ ...auth, password: event.target.value })}
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {auth.type === 'apiKey' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rest-api-client-auth-key">{t('request.auth.apiKey.keyLabel')}</Label>
              <Input
                id="rest-api-client-auth-key"
                value={auth.key}
                onChange={(event) => onChange({ ...auth, key: event.target.value })}
                placeholder={t('request.auth.apiKey.keyPlaceholder')}
                spellCheck={false}
                autoComplete="off"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rest-api-client-auth-value">
                {t('request.auth.apiKey.valueLabel')}
              </Label>
              <Input
                id="rest-api-client-auth-value"
                value={auth.value}
                onChange={(event) => onChange({ ...auth, value: event.target.value })}
                spellCheck={false}
                autoComplete="off"
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rest-api-client-auth-add-to">
              {t('request.auth.apiKey.addToLabel')}
            </Label>
            <Select
              value={auth.addTo}
              onValueChange={(value) => onChange({ ...auth, addTo: value as 'header' | 'query' })}
            >
              <SelectTrigger id="rest-api-client-auth-add-to" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">{t('request.auth.apiKey.addToHeader')}</SelectItem>
                <SelectItem value="query">{t('request.auth.apiKey.addToQuery')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
