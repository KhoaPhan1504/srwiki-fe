import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlgorithmKeyPanel } from './components/AlgorithmKeyPanel';
import { HeaderPanel } from './components/HeaderPanel';
import { PayloadPanel } from './components/PayloadPanel';
import { SignaturePanel } from './components/SignaturePanel';
import { TokenInfoPanel } from './components/TokenInfoPanel';
import { TokenInputPanel } from './components/TokenInputPanel';
import { TokenStatusBanner } from './components/TokenStatusBanner';
import { useJwtWebTokenHooks } from './hooks';

export const JwtWebTokenPage = () => {
  const { t } = useTranslation('jwt-web-token');
  const {
    token,
    setToken,
    headerText,
    setHeaderText,
    payloadText,
    setPayloadText,
    headerError,
    payloadError,
    decodeError,
    algorithm,
    setAlgorithm,
    secret,
    setSecret,
    privateKey,
    setPrivateKey,
    publicKey,
    setPublicKey,
    signError,
    signatureStatus,
    handleClear,
  } = useJwtWebTokenHooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in oklch, var(--dashboard-accent) 15%, transparent)',
          }}
        >
          <KeyRound className="h-5 w-5" style={{ color: 'var(--dashboard-accent)' }} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <TokenInputPanel
        value={token}
        onChange={setToken}
        onClear={handleClear}
        error={decodeError}
      />

      <TokenStatusBanner payloadText={payloadText} />

      <AlgorithmKeyPanel
        algorithm={algorithm}
        onAlgorithmChange={setAlgorithm}
        secret={secret}
        onSecretChange={setSecret}
        privateKey={privateKey}
        onPrivateKeyChange={setPrivateKey}
        publicKey={publicKey}
        onPublicKeyChange={setPublicKey}
        signError={signError}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HeaderPanel value={headerText} onChange={setHeaderText} error={headerError} />
        <PayloadPanel value={payloadText} onChange={setPayloadText} error={payloadError} />
      </div>

      <TokenInfoPanel payloadText={payloadText} />

      <SignaturePanel token={token} signatureStatus={signatureStatus} />
    </div>
  );
};
