import { useState } from 'react';
import { UUIDCase, UUIDVersion } from '~root/constants';
import { DEFAULT_QUANTITY, formatUuid, generateUuid, validateQuantity } from '~root/utils';

export const useUuidGeneratorHooks = () => {
  const [version, setVersion] = useState<UUIDVersion>(UUIDVersion.V4);
  const [quantity, setQuantity] = useState(String(DEFAULT_QUANTITY));
  const [caseOption, setCaseOption] = useState<UUIDCase>(UUIDCase.LOWER);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [resultsVersion, setResultsVersion] = useState<UUIDVersion>(UUIDVersion.V4);

  const quantityValidation = validateQuantity(quantity);

  const handleGenerate = () => {
    if (!quantityValidation.valid) return;

    const generated = Array.from({ length: quantityValidation.value }, () =>
      formatUuid(generateUuid(version), { case: caseOption, removeHyphens }),
    );
    setResults(generated);
    setResultsVersion(version);
  };

  const handleClear = () => {
    setResults([]);
  };

  return {
    version,
    setVersion,
    quantity,
    setQuantity,
    quantityValidation,
    caseOption,
    setCaseOption,
    removeHyphens,
    setRemoveHyphens,
    results,
    resultsVersion,
    handleGenerate,
    handleClear,
  };
};
