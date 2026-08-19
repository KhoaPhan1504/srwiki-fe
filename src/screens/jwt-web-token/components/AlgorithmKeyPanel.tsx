import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '~root/components/ui';
import type { SigningError } from '~root/screens/jwt-web-token/crypto';
import type { JwtAlgorithm } from '~root/constants';

const ALGORITHM_GROUPS: { labelKey: string; algorithms: JwtAlgorithm[] }[] = [
  { labelKey: 'signing.groupHmac', algorithms: ['HS256', 'HS384', 'HS512'] },
  { labelKey: 'signing.groupRsa', algorithms: ['RS256', 'RS384', 'RS512'] },
  { labelKey: 'signing.groupRsaPss', algorithms: ['PS256', 'PS384', 'PS512'] },
  { labelKey: 'signing.groupEcdsa', algorithms: ['ES256', 'ES384', 'ES512'] },
];

const SIGN_ERROR_KEY: Partial<Record<SigningError['code'], string>> = {
  INVALID_KEY: 'signing.errors.invalidKey',
  SIGNING_FAILED: 'signing.errors.signingFailed',
};

const isHmacAlgorithm = (alg: JwtAlgorithm): boolean => alg.startsWith('HS');

type Props = {
  algorithm: JwtAlgorithm;
  onAlgorithmChange: (alg: JwtAlgorithm) => void;
  secret: string;
  onSecretChange: (value: string) => void;
  privateKey: string;
  onPrivateKeyChange: (value: string) => void;
  publicKey: string;
  onPublicKeyChange: (value: string) => void;
  signError: SigningError | null;
};

export const AlgorithmKeyPanel = ({
  algorithm,
  onAlgorithmChange,
  secret,
  onSecretChange,
  privateKey,
  onPrivateKeyChange,
  publicKey,
  onPublicKeyChange,
  signError,
}: Props) => {
  const { t } = useTranslation('jwt-web-token');

  const signErrorKey = signError ? SIGN_ERROR_KEY[signError.code] : undefined;

  return (
    <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm font-medium">{t('signing.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">{t('signing.algorithmLabel')}</p>
          <Select
            value={algorithm}
            onValueChange={(value) => onAlgorithmChange(value as JwtAlgorithm)}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label={t('signing.algorithmLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHM_GROUPS.map((group) => (
                <SelectGroup key={group.labelKey}>
                  <SelectLabel>{t(group.labelKey)}</SelectLabel>
                  {group.algorithms.map((alg) => (
                    <SelectItem key={alg} value={alg}>
                      {alg}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isHmacAlgorithm(algorithm) ? (
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">{t('signing.secretLabel')}</p>
            <Input
              value={secret}
              onChange={(event) => onSecretChange(event.target.value)}
              placeholder={t('signing.secretPlaceholder')}
              spellCheck={false}
              aria-label={t('signing.secretLabel')}
              aria-invalid={signErrorKey !== undefined}
              className="font-mono text-sm"
            />
            {signErrorKey && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {t(signErrorKey)}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">{t('signing.privateKeyLabel')}</p>
              <Textarea
                value={privateKey}
                onChange={(event) => onPrivateKeyChange(event.target.value)}
                placeholder={t('signing.privateKeyPlaceholder')}
                spellCheck={false}
                aria-label={t('signing.privateKeyLabel')}
                aria-invalid={signErrorKey !== undefined}
                className="h-32 resize-none font-mono text-xs break-all"
              />
              {signErrorKey && (
                <p role="alert" className="mt-1.5 text-xs text-destructive">
                  {t(signErrorKey)}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">{t('signing.publicKeyLabel')}</p>
              <Textarea
                value={publicKey}
                onChange={(event) => onPublicKeyChange(event.target.value)}
                placeholder={t('signing.publicKeyPlaceholder')}
                spellCheck={false}
                aria-label={t('signing.publicKeyLabel')}
                className="h-32 resize-none font-mono text-xs break-all"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
