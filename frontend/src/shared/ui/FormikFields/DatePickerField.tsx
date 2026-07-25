import { Field, type FieldProps } from 'formik';
import { type FC } from 'react';

import {
  DatePickerInput as MantineDateTimePicker,
  type DateTimePickerProps as MantineDateTimePickerProps,
} from '@mantine/dates';

type DatePickerFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  valueFormat?: string;
  className: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  minDate?: Date;
  locale?: string;
  popoverZIndex?: number;
};

const getDayProps: MantineDateTimePickerProps['getDayProps'] = (date) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (date === todayStr) {
    return {
      style: {
        backgroundColor: 'var(--mantine-color-blue-light)',
        color: 'var(--mantine-color-blue)',
      },
    };
  }

  return {};
};

export const DatePickerField: FC<DatePickerFieldProps> = (props) => {
  const {
    name,
    label,
    placeholder,
    valueFormat = 'DD-MM-YYYY',
    className,
    disabled,
    required,
    clearable,
    locale,
    minDate,
    popoverZIndex = 1000,
  } = props;

  return (
    <Field name={name}>
      {({ field, meta, form: { setFieldValue } }: FieldProps) => (
        <div className={className}>
          <MantineDateTimePicker
            {...field}
            placeholder={placeholder}
            valueFormat={valueFormat}
            label={label}
            disabled={disabled}
            clearable={clearable}
            locale={locale}
            getDayProps={getDayProps}
            onChange={(value) => setFieldValue(name, value)}
            error={meta.touched && meta.error && meta.error}
            required={required}
            minDate={minDate}
            popoverProps={{
              zIndex: popoverZIndex,
            }}
            classNames={{
              root: 'leading-4',
              label: 'mb-1',
              error: 'mt-1',
            }}
          />
        </div>
      )}
    </Field>
  );
};
