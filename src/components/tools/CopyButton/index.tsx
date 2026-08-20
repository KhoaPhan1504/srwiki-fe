import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '~root/components/ui';

type Props = {
  value: string;
  label: string;
  copiedLabel: string;
  errorMessage: string;
  disabled?: boolean;
};

export const CopyButton = ({ value, label, copiedLabel, errorMessage, disabled }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(errorMessage, { position: 'bottom-center' });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={disabled ?? !value}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? (
        <Check className="h-4 w-4 sm:mr-2" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4 sm:mr-2" aria-hidden="true" />
      )}
      <span className="hidden sm:inline" aria-hidden="true">
        {copied ? copiedLabel : label}
      </span>
    </Button>
  );
};
