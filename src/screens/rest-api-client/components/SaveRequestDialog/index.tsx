import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~root/components/ui';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import { useCreateCollection, useCreateSavedRequest } from '~root/apis';
import { useSaveRequestSchema, type SaveRequestValues } from '~root/schemas';
import type { Collection, RestRequestConfig, SavedRequest } from '~root/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  requestState: RestRequestConfig;
  onSaved: (savedRequest: SavedRequest) => void;
};

export const SaveRequestDialog = ({
  open,
  onOpenChange,
  collections,
  requestState,
  onSaved,
}: Props) => {
  const { t } = useTranslation('rest-api-client');
  const { mutateAsync: createCollection, isPending: isCreatingCollection } = useCreateCollection();
  const { mutateAsync: createSavedRequest, isPending: isCreatingRequest } = useCreateSavedRequest();
  const form = useForm<SaveRequestValues>({
    resolver: zodResolver(useSaveRequestSchema()),
    defaultValues: {
      mode: collections.length > 0 ? 'existing' : 'new',
      collectionId: collections[0]?.id ?? '',
      newCollectionName: '',
      requestName: '',
    },
  });
  const mode = form.watch('mode');

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'RadioGroupField',
      name: 'mode',
      label: t('collections.saveDialog.modeLabel'),
      colSpan: 'col-span-12',
      items: [
        {
          value: 'existing',
          label: t('collections.saveDialog.modeExisting'),
          disabled: collections.length === 0,
        },
        { value: 'new', label: t('collections.saveDialog.modeNew') },
      ],
    },
    mode === 'existing'
      ? {
          inputType: 'SelectField',
          name: 'collectionId',
          label: t('collections.saveDialog.collectionLabel'),
          colSpan: 'col-span-12',
          items: collections.map((c) => ({ value: c.id, label: c.name })),
        }
      : {
          inputType: 'TextField',
          name: 'newCollectionName',
          label: t('collections.saveDialog.newCollectionLabel'),
          colSpan: 'col-span-12',
        },
    {
      inputType: 'TextField',
      name: 'requestName',
      label: t('collections.saveDialog.requestNameLabel'),
      colSpan: 'col-span-12',
    },
  ];

  const onSubmit = async (values: SaveRequestValues) => {
    const collectionId =
      values.mode === 'existing'
        ? (values.collectionId as string)
        : (await createCollection({ name: values.newCollectionName!.trim() })).id;

    const saved = await createSavedRequest({
      collectionId,
      name: values.requestName,
      ...requestState,
    });
    onSaved(saved);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('collections.saveDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} />
          <DialogFooter>
            <Button type="submit" disabled={isCreatingCollection || isCreatingRequest}>
              {t('collections.saveDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
