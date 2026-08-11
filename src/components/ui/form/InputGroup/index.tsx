// src/components/form/InputGroup/index.tsx
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { cn } from '~root/lib/utils';
import { SrTextField } from './fields/TextField';
import { SrPasswordField } from './fields/PasswordField';
import { SrNumberField } from './fields/NumberField';
import { SrTextAreaField } from './fields/TextAreaField';
import { SrSelectField } from './fields/SelectField';
import { SrDropDownListField } from './fields/DropDownListField';
import { SrCheckboxGroupField } from './fields/CheckboxGroupField';
import { SrRadioGroupField } from './fields/RadioGroupField';
import { SrRadioActionField } from './fields/RadioActionField';
import { SrPhoneNumberField } from './fields/PhoneNumberField';
import { SrDatePickerField } from './fields/DatePickerField';
import { SrDateRangePicker } from './fields/DateRangePicker';
import { SrDateRangeWithTimespanField } from './fields/DateRangeWithTimespanField';
import { SrTimePickerField } from './fields/TimePickerField';
import { SrCalendarField } from './fields/CalendarField';
import { SrRichTextField } from './fields/RichTextField';
import { SrAutoCompleteField } from './fields/AutoCompleteField';
import { SrDynamicAutoCompleteField } from './fields/DynamicAutoCompleteField';
import { SrScrollableAutoComplete } from './fields/ScrollableAutoComplete';
import { SrMultipleSearchKeywordsField } from './fields/MultipleSearchKeywordsField';
import type { SrFormFieldConfig } from './types';

const InputRender = (field: SrFormFieldConfig) => {
  switch (field.inputType) {
    case 'TextField':
      return <SrTextField {...field} />;
    case 'PasswordField':
      return <SrPasswordField {...field} />;
    case 'NumberField':
      return <SrNumberField {...field} />;
    case 'TextAreaField':
      return <SrTextAreaField {...field} />;
    case 'SelectField':
      return <SrSelectField {...field} />;
    case 'DropDownListField':
      return <SrDropDownListField {...field} />;
    case 'CheckboxGroupField':
      return <SrCheckboxGroupField {...field} />;
    case 'RadioGroupField':
      return <SrRadioGroupField {...field} />;
    case 'RadioActionField':
      return <SrRadioActionField {...field} />;
    case 'PhoneNumberField':
      return <SrPhoneNumberField {...field} />;
    case 'DatePickerField':
      return <SrDatePickerField {...field} />;
    case 'DateRangePicker':
      return <SrDateRangePicker {...field} />;
    case 'DateRangeWithTimespanField':
      return <SrDateRangeWithTimespanField {...field} />;
    case 'TimePickerField':
      return <SrTimePickerField {...field} />;
    case 'CalendarField':
      return <SrCalendarField {...field} />;
    case 'RichTextField':
      return <SrRichTextField {...field} />;
    case 'AutoCompleteField':
      return <SrAutoCompleteField {...field} />;
    case 'DynamicAutoCompleteField':
      return <SrDynamicAutoCompleteField {...field} />;
    case 'ScrollableAutoComplete':
      return <SrScrollableAutoComplete {...field} />;
    case 'MultipleSearchKeywords':
      return <SrMultipleSearchKeywordsField {...field} />;
    default:
      return null;
  }
};

type SrInputGroupProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- UseFormReturn's TContext/TFieldValues generics require `any` here to accept form handlers built from concrete (non-FieldValues) schemas.
  formHandler: UseFormReturn<FieldValues, any> | UseFormReturn<any, any>;
  formStructure: SrFormFieldConfig[];
  gridCols?: string;
  gap?: string;
  disabled?: boolean;
  className?: string;
};

export const SrInputGroup = ({
  formHandler,
  formStructure,
  gridCols,
  gap,
  disabled,
  className,
}: SrInputGroupProps) => (
  <FormProvider {...formHandler}>
    <div className={cn('grid', gridCols ?? 'grid-cols-12', gap ?? 'gap-x-4 gap-y-3', className)}>
      {formStructure.map((field, index) => (
        <div key={index} className={field.colSpan}>
          <InputRender {...field} disabled={disabled || field.disabled} />
        </div>
      ))}
    </div>
  </FormProvider>
);

export { SrTextField } from './fields/TextField';
export { SrPasswordField } from './fields/PasswordField';
export { SrNumberField } from './fields/NumberField';
export { SrTextAreaField } from './fields/TextAreaField';
export { SrSelectField } from './fields/SelectField';
export { SrDropDownListField } from './fields/DropDownListField';
export { SrCheckboxGroupField } from './fields/CheckboxGroupField';
export { SrRadioGroupField } from './fields/RadioGroupField';
export { SrRadioActionField } from './fields/RadioActionField';
export { SrPhoneNumberField } from './fields/PhoneNumberField';
export { SrDatePickerField } from './fields/DatePickerField';
export { SrDateRangePicker } from './fields/DateRangePicker';
export { SrDateRangeWithTimespanField } from './fields/DateRangeWithTimespanField';
export { SrTimePickerField } from './fields/TimePickerField';
export { SrCalendarField } from './fields/CalendarField';
export { SrRichTextField } from './fields/RichTextField';
export { SrAutoCompleteField } from './fields/AutoCompleteField';
export { SrDynamicAutoCompleteField } from './fields/DynamicAutoCompleteField';
export { SrScrollableAutoComplete } from './fields/ScrollableAutoComplete';
export { SrMultipleSearchKeywordsField } from './fields/MultipleSearchKeywordsField';
export type {
  SrFormFieldConfig,
  SrSelectItem,
  SrTextFieldProps,
  SrPasswordFieldProps,
  SrNumberFieldProps,
  SrTextAreaFieldProps,
  SrSelectFieldProps,
  SrDropDownListFieldProps,
  SrCheckboxGroupFieldProps,
  SrRadioGroupFieldProps,
  SrRadioActionFieldProps,
  SrPhoneNumberFieldProps,
  SrDatePickerFieldProps,
  SrDateRangePickerProps,
  SrDateRangeWithTimespanFieldProps,
  SrTimePickerFieldProps,
  SrCalendarFieldProps,
  SrRichTextFieldProps,
  SrAutoCompleteFieldProps,
  SrDynamicAutoCompleteFieldProps,
  SrScrollableAutoCompleteProps,
  SrMultipleSearchKeywordsFieldProps,
} from './types';
