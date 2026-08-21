import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const useRenamePromptSchema = () => {
  const { t } = useTranslation('rest-api-client');
  return z.object({
    name: z.string().min(1, t('collections.renamePrompt.validation.nameRequired')),
  });
};

export type RenamePromptValues = z.infer<ReturnType<typeof useRenamePromptSchema>>;

export const useSaveRequestSchema = () => {
  const { t } = useTranslation('rest-api-client');
  return z
    .object({
      mode: z.enum(['existing', 'new']),
      collectionId: z.string().optional(),
      newCollectionName: z.string().optional(),
      requestName: z.string().min(1, t('collections.saveDialog.validation.requestNameRequired')),
    })
    .refine(
      (data) => (data.mode === 'new' ? !!data.newCollectionName?.trim() : !!data.collectionId),
      {
        message: t('collections.saveDialog.validation.collectionRequired'),
        path: ['collectionId'],
      },
    );
};

export type SaveRequestValues = z.infer<ReturnType<typeof useSaveRequestSchema>>;
