// src/components/form/InputGroup/types.ts
import type { ReactNode } from 'react';

export type SrSelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SrFieldLayout = {
  colSpan: string;
};

type SrGenericFormInput = {
  name: string;
  label?: ReactNode;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
};

export type SrTextFieldProps = SrGenericFormInput;
export type SrNumberFieldProps = SrGenericFormInput;
export type SrPasswordFieldProps = SrGenericFormInput;
export type SrTextAreaFieldProps = SrGenericFormInput & { rows?: number };
export type SrSelectFieldProps = SrGenericFormInput & { items: SrSelectItem[] };
export type SrDropDownListFieldProps = SrGenericFormInput & { items: SrSelectItem[] };
export type SrCheckboxGroupFieldProps = SrGenericFormInput & { items: SrSelectItem[] };
export type SrRadioGroupFieldProps = SrGenericFormInput & { items: SrSelectItem[] };
export type SrRadioActionFieldProps = SrRadioGroupFieldProps;
export type SrPhoneNumberFieldProps = SrGenericFormInput;
export type SrDatePickerFieldProps = SrGenericFormInput & { minDate?: Date; maxDate?: Date };

export type SrDateRangePickerProps = {
  fromName: string;
  toName: string;
  fromLabel?: ReactNode;
  toLabel?: ReactNode;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
};

export type SrDateRangeWithTimespanFieldProps = SrDateRangePickerProps & {
  isEmptyName: string;
  emptyLabel?: string;
};

export type SrTimePickerFieldProps = SrGenericFormInput;
export type SrCalendarFieldProps = SrGenericFormInput & { slots: string[]; minDate?: Date };
export type SrRichTextFieldProps = SrGenericFormInput;
export type SrAutoCompleteFieldProps = SrGenericFormInput & {
  items: SrSelectItem[];
  multiple?: boolean;
};

export type SrDynamicAutoCompleteFieldProps = SrGenericFormInput & {
  items: SrSelectItem[];
  isLoading?: boolean;
  multiple?: boolean;
  handleSearch: (query: string) => void;
};

export type SrScrollableAutoCompleteProps = SrGenericFormInput & {
  items: SrSelectItem[];
  isLoading?: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
};

export type SrMultipleSearchKeywordsFieldProps = SrGenericFormInput & { maxKeywords?: number };

export type SrFormFieldConfig =
  | (SrTextFieldProps & SrFieldLayout & { inputType: 'TextField' })
  | (SrPasswordFieldProps & SrFieldLayout & { inputType: 'PasswordField' })
  | (SrNumberFieldProps & SrFieldLayout & { inputType: 'NumberField' })
  | (SrTextAreaFieldProps & SrFieldLayout & { inputType: 'TextAreaField' })
  | (SrSelectFieldProps & SrFieldLayout & { inputType: 'SelectField' })
  | (SrDropDownListFieldProps & SrFieldLayout & { inputType: 'DropDownListField' })
  | (SrCheckboxGroupFieldProps & SrFieldLayout & { inputType: 'CheckboxGroupField' })
  | (SrRadioGroupFieldProps & SrFieldLayout & { inputType: 'RadioGroupField' })
  | (SrRadioActionFieldProps & SrFieldLayout & { inputType: 'RadioActionField' })
  | (SrPhoneNumberFieldProps & SrFieldLayout & { inputType: 'PhoneNumberField' })
  | (SrDatePickerFieldProps & SrFieldLayout & { inputType: 'DatePickerField' })
  | (SrDateRangePickerProps & SrFieldLayout & { inputType: 'DateRangePicker' })
  | (SrDateRangeWithTimespanFieldProps &
      SrFieldLayout & { inputType: 'DateRangeWithTimespanField' })
  | (SrTimePickerFieldProps & SrFieldLayout & { inputType: 'TimePickerField' })
  | (SrCalendarFieldProps & SrFieldLayout & { inputType: 'CalendarField' })
  | (SrRichTextFieldProps & SrFieldLayout & { inputType: 'RichTextField' })
  | (SrAutoCompleteFieldProps & SrFieldLayout & { inputType: 'AutoCompleteField' })
  | (SrDynamicAutoCompleteFieldProps & SrFieldLayout & { inputType: 'DynamicAutoCompleteField' })
  | (SrScrollableAutoCompleteProps & SrFieldLayout & { inputType: 'ScrollableAutoComplete' })
  | (SrMultipleSearchKeywordsFieldProps & SrFieldLayout & { inputType: 'MultipleSearchKeywords' });
