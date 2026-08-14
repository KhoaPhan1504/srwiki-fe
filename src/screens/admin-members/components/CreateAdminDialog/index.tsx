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
import { useCreateAdmin } from '~root/apis';
import { useCreateAdminSchema, type CreateAdminValues } from '~root/schemas';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateAdminDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation('admin-members');
  const { mutate: createAdmin, isPending } = useCreateAdmin();
  const form = useForm<CreateAdminValues>({
    resolver: zodResolver(useCreateAdminSchema()),
    defaultValues: { email: '', password: '', fullName: '', address: '', dateOfBirth: '' },
  });

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'TextField',
      name: 'email',
      label: t('createAdmin.email'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'PasswordField',
      name: 'password',
      label: t('createAdmin.password'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'TextField',
      name: 'fullName',
      label: t('createAdmin.fullName'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'TextField',
      name: 'address',
      label: t('createAdmin.address'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'DatePickerField',
      name: 'dateOfBirth',
      label: t('createAdmin.dateOfBirth'),
      colSpan: 'col-span-12',
    },
  ];

  const onSubmit = (values: CreateAdminValues) => {
    createAdmin(
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
          <DialogTitle>{t('createAdmin.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {t('createAdmin.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
