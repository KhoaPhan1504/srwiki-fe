import { formatDistanceToNow } from 'date-fns';
import { CircleCheck, CircleX, Clock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '~root/i18n/dateLocale';
import type { Language } from '~root/constants';
import { extractClaims, getTokenStatus } from '../utils';

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

export const TokenStatusBanner = ({ payloadText }: Props) => {
  const { t, i18n } = useTranslation('jwt-web-token');
  const payload = parsePayload(payloadText);
  if (!payload) return null;

  const locale = getDateFnsLocale(i18n.language as Language);
  const claims = extractClaims(payload);
  const status = getTokenStatus(claims);

  const variant =
    status.state === 'expired'
      ? 'destructive'
      : status.state === 'not-yet-valid'
        ? 'accent'
        : status.state === 'active'
          ? 'valid'
          : 'muted';

  const Icon =
    status.state === 'expired'
      ? CircleX
      : status.state === 'not-yet-valid'
        ? Clock
        : status.state === 'active'
          ? CircleCheck
          : Info;

  const colorVar =
    variant === 'destructive'
      ? 'var(--destructive)'
      : variant === 'accent'
        ? 'var(--dashboard-accent)'
        : variant === 'valid'
          ? 'var(--verify-primary)'
          : undefined;

  const title =
    status.state === 'expired'
      ? t('status.expiredTitle')
      : status.state === 'not-yet-valid'
        ? t('status.notYetValidTitle')
        : status.state === 'active'
          ? t('status.activeTitle')
          : t('status.noExpiration');

  const detail =
    status.state === 'expired'
      ? t('status.expiredTime', {
          time: formatDistanceToNow(status.expiredAt, { addSuffix: true, locale }),
        })
      : status.state === 'not-yet-valid'
        ? t('status.notYetValidTime', {
            time: formatDistanceToNow(status.startsAt, { addSuffix: true, locale }),
          })
        : status.state === 'active'
          ? t('status.activeTime', {
              time: formatDistanceToNow(status.expiresAt, { addSuffix: true, locale }),
            })
          : null;

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl border p-4 shadow-[var(--dashboard-card-shadow)]"
      style={
        colorVar ? { borderColor: `color-mix(in oklch, ${colorVar} 40%, transparent)` } : undefined
      }
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in oklch, ${colorVar ?? 'var(--muted-foreground)'} 15%, transparent)`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: colorVar }} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
};
