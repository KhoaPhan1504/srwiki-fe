import { useEffect } from 'react';
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
import { useRenamePromptSchema, type RenamePromptValues } from '~root/schemas';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: string;
  onSubmit: (value: string) => void;
  isPending?: boolean;
};

export const RenamePromptDialog = ({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
  isPending,
}: Props) => {
  const { t } = useTranslation('rest-api-client');
  const form = useForm<RenamePromptValues>({
    resolver: zodResolver(useRenamePromptSchema()),
    defaultValues: { name: initialValue },
  });

  useEffect(() => {
    if (open) form.reset({ name: initialValue });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'TextField',
      name: 'name',
      label: t('collections.renamePrompt.nameLabel'),
      colSpan: 'col-span-12',
    },
  ];

  const handleSubmit = (values: RenamePromptValues) => {
    onSubmit(values.name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {t('collections.renamePrompt.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
