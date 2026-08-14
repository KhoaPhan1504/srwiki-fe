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
import { useUpdateMember } from '~root/apis';
import type { Member } from '~root/apis';
import { useEditMemberSchema, type EditMemberValues } from '~root/schemas';
import { MembershipTier } from '~root/constants';

type Props = {
  mode: 'view' | 'edit';
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MemberFormDialog = ({ mode, member, open, onOpenChange }: Props) => {
  const { t } = useTranslation('admin-members');
  const { mutate: updateMember, isPending } = useUpdateMember();
  const isView = mode === 'view';
  const form = useForm<EditMemberValues>({
    resolver: zodResolver(useEditMemberSchema()),
    defaultValues: {
      fullName: member.fullName ?? '',
      address: member.address ?? '',
      dateOfBirth: member.dateOfBirth ?? '',
      membershipTier: member.membershipTier ?? MembershipTier.REGULAR,
    },
  });

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'TextField',
      name: 'fullName',
      label: t('edit.fullName'),
      colSpan: 'col-span-12',
      disabled: isView,
    },
    {
      inputType: 'TextField',
      name: 'address',
      label: t('edit.address'),
      colSpan: 'col-span-12',
      disabled: isView,
    },
    {
      inputType: 'DatePickerField',
      name: 'dateOfBirth',
      label: t('edit.dateOfBirth'),
      colSpan: 'col-span-12',
      disabled: isView,
    },
    {
      inputType: 'SelectField',
      name: 'membershipTier',
      label: t('edit.membershipTier'),
      colSpan: 'col-span-12',
      disabled: isView,
      items: [
        { value: MembershipTier.REGULAR, label: t('table.membershipTier.regular') },
        { value: MembershipTier.VIP, label: t('table.membershipTier.vip') },
      ],
    },
  ];

  const onSubmit = (values: EditMemberValues) => {
    updateMember(
      {
        id: member.id,
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
          <DialogTitle>{isView ? t('view.title') : t('edit.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{member.email}</span>
          <Badge variant="outline">{t(`table.role.${member.role}`)}</Badge>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} disabled={isView} />
          {!isView && (
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {t('edit.submit')}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
