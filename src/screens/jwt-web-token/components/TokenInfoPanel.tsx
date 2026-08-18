import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '~root/components/ui';
import { getDateFnsLocale } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';
import { extractClaims, getTokenStatus, numericDateToDate } from '../utils';

type Props = { payloadText: string };

const parsePayload = (text: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const TokenInfoPanel = ({ payloadText }: Props) => {
  const { t, i18n } = useTranslation('jwt-web-token');
  const payload = parsePayload(payloadText);
  const locale = getDateFnsLocale(i18n.language as Language);

  const claims = payload ? extractClaims(payload) : {};
  const hasClaims = Object.keys(claims).length > 0;
  const status = hasClaims ? getTokenStatus(claims) : null;

  const formatDate = (numericDate: number) =>
    format(numericDateToDate(numericDate), 'PPpp', { locale });

  const statusLabel =
    status?.state === 'expired'
      ? t('status.expiredTitle')
      : status?.state === 'not-yet-valid'
        ? t('status.notYetValidTitle')
        : status?.state === 'active'
          ? t('status.activeTitle')
          : status?.state === 'no-expiration'
            ? t('info.noExpirationStatus')
            : null;

  const items: { label: string; value: string }[] = [];
  if (statusLabel) items.push({ label: t('info.status'), value: statusLabel });
  if (claims.iat !== undefined)
    items.push({ label: t('info.issuedAt'), value: formatDate(claims.iat) });
  if (claims.exp !== undefined)
    items.push({ label: t('info.expires'), value: formatDate(claims.exp) });
  if (claims.nbf !== undefined)
    items.push({ label: t('info.notBefore'), value: formatDate(claims.nbf) });
  if (claims.iss !== undefined) items.push({ label: t('info.issuer'), value: claims.iss });
  if (claims.sub !== undefined) items.push({ label: t('info.subject'), value: claims.sub });
  if (claims.aud !== undefined) {
    items.push({
      label: t('info.audience'),
      value: Array.isArray(claims.aud) ? claims.aud.join(', ') : claims.aud,
    });
  }
  if (claims.jti !== undefined) items.push({ label: t('info.jwtId'), value: claims.jti });

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-medium">{t('info.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium break-all">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t('info.empty')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
