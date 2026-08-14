import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Button,
} from '~root/components/ui';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import { useFilterSchema, type FilterFormValues } from '~root/schemas';
import { EMPTY_FILTERS } from '../../types';
import type { MemberFilters } from '../../types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appliedFilters: MemberFilters;
  onApply: (filters: MemberFilters) => void;
  onClearAll: () => void;
};

export const FilterSheet = ({ open, onOpenChange, appliedFilters, onApply, onClearAll }: Props) => {
  const { t } = useTranslation('admin-members');
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(useFilterSchema()),
    defaultValues: appliedFilters,
  });

  useEffect(() => {
    // Re-seed the draft from the last applied state every time the Sheet
    // opens, so an unsaved edit left over from a previous open-without-Apply
    // doesn't leak into the next session.
    if (open) form.reset(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'CheckboxGroupField',
      name: 'membershipTier',
      label: t('filter.membershipTier'),
      colSpan: 'col-span-12',
      items: [
        { value: 'regular', label: t('table.membershipTier.regular') },
        { value: 'vip', label: t('table.membershipTier.vip') },
      ],
    },
    {
      inputType: 'DateRangePicker',
      fromName: 'createdAtFrom',
      toName: 'createdAtTo',
      fromLabel: t('filter.createdAtFrom'),
      toLabel: t('filter.createdAtTo'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'TextField',
      name: 'address',
      label: t('filter.address'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'DateRangePicker',
      fromName: 'birthdayFrom',
      toName: 'birthdayTo',
      fromLabel: t('filter.birthdayFrom'),
      toLabel: t('filter.birthdayTo'),
      colSpan: 'col-span-12',
    },
  ];

  const onSubmit = (values: FilterFormValues) => {
    onApply(values);
    onOpenChange(false);
  };

  const handleClearAll = () => {
    form.reset(EMPTY_FILTERS);
    onClearAll();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('filter.title')}</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 px-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} />
          <SheetFooter className="flex-row justify-between px-0">
            <Button type="button" variant="outline" onClick={handleClearAll}>
              {t('filter.clearAll')}
            </Button>
            <Button type="submit">{t('filter.apply')}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
