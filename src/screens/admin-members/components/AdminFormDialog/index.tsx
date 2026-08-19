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
  Badge,
} from '~root/components/ui';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import { useUpdateAdmin } from '~root/apis';
import type { Admin } from '~root/apis';
import { useEditAdminSchema, type EditAdminValues } from '~root/schemas';
import type { FormDialogMode } from '~root/constants';

type Props = {
  mode: FormDialogMode;
  admin: Admin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AdminFormDialog = ({ mode, admin, open, onOpenChange }: Props) => {
  const { t } = useTranslation('admin-members');
  const { mutate: updateAdmin, isPending } = useUpdateAdmin();
  const isView = mode === 'view';
  const form = useForm<EditAdminValues>({
    resolver: zodResolver(useEditAdminSchema()),
    defaultValues: {
      fullName: admin.fullName ?? '',
      address: admin.address ?? '',
      dateOfBirth: admin.dateOfBirth ?? '',
    },
  });

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'TextField',
      name: 'fullName',
      label: t('editAdmin.fullName'),
      colSpan: 'col-span-12',
      disabled: isView,
    },
    {
      inputType: 'TextField',
      name: 'address',
      label: t('editAdmin.address'),
      colSpan: 'col-span-12',
      disabled: isView,
    },
    {
      inputType: 'DatePickerField',
      name: 'dateOfBirth',
      label: t('editAdmin.dateOfBirth'),
      colSpan: 'col-span-12',
      disabled: isView,
    },
  ];

  const onSubmit = (values: EditAdminValues) => {
    updateAdmin(
      {
        id: admin.id,
        ...values,
        address: values.address || null,
        dateOfBirth: values.dateOfBirth || null,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isView ? t('viewAdmin.title') : t('editAdmin.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{admin.email}</span>
          <Badge variant="outline">{t(`adminsTable.role.${admin.role}`)}</Badge>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} disabled={isView} />
          {!isView && (
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {t('editAdmin.submit')}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
