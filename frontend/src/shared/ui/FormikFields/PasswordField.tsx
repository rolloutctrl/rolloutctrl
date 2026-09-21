import { FastField, Field, type FieldProps } from 'formik';
import { type FC } from 'react';

import { PasswordInput } from '@mantine/core';

type PasswordFieldProps = {
  type?: string;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  isFastField?: boolean;
};

export const PasswordField: FC<PasswordFieldProps> = (props) => {
  const {
    name,
    label,
    type = 'text',
    placeholder,
    description,
    disabled,
    required,
    isFastField,
  } = props;

  if (isFastField) {
    return (
      <FastField name={name}>
        {({ field, meta }: FieldProps) => (
          <PasswordInput
            {...field}
            type={type}
            placeholder={placeholder}
            label={label}
            disabled={disabled}
            error={meta.touched && meta.error}
            required={required}
          />
        )}
      </FastField>
    );
  }

  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <PasswordInput
          {...field}
          type={type}
          placeholder={placeholder}
          label={label}
          disabled={disabled}
          description={description}
          error={meta.touched && meta.error && meta.error}
          required={required}
          visibilityToggleButtonProps={{
            'aria-label': 'Toggle password visibility',
          }}
        />
      )}
    </Field>
  );
};
