import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '~root/components/ui';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import { useCreateMember } from '~root/apis';
import { useCreateMemberSchema, type CreateMemberValues } from '~root/schemas';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateMemberDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation('admin-members');
  const { mutate: createMember, isPending } = useCreateMember();
  const form = useForm<CreateMemberValues>({
    resolver: zodResolver(useCreateMemberSchema()),
    defaultValues: { email: '', password: '', fullName: '', address: '', dateOfBirth: '' },
  });

  const formStructure: SrFormFieldConfig[] = [
    { inputType: 'TextField', name: 'email', label: t('create.email'), colSpan: 'col-span-12' },
    {
      inputType: 'PasswordField',
      name: 'password',
      label: t('create.password'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'TextField',
      name: 'fullName',
      label: t('create.fullName'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'TextField',
      name: 'address',
      label: t('create.address'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'DatePickerField',
      name: 'dateOfBirth',
      label: t('create.dateOfBirth'),
      colSpan: 'col-span-12',
    },
  ];

  const onSubmit = (values: CreateMemberValues) => {
    createMember(
      {
        ...values,
        address: values.address || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {t('create.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
