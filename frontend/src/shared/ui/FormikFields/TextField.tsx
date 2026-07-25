import { FastField, Field, type FieldProps } from "formik";
import { type FC } from "react";

import { TextInput } from "@mantine/core";

type TextFieldProps = {
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

export const TextField: FC<TextFieldProps> = (props) => {
  const {
    name,
    label,
    type = "text",
    placeholder,
    disabled,
    required,
    description,
    isFastField,
    className,
  } = props;

  if (isFastField) {
    return (
      <FastField name={name}>
        {({ field: { value, ...restFields }, meta }: FieldProps) => (
          <div className={className}>
            <TextInput
              {...restFields}
              value={value || ""}
              type={type}
              placeholder={placeholder}
              label={label}
              disabled={disabled}
              error={meta.touched && meta.error}
              required={required}
            />
          </div>
        )}
      </FastField>
    );
  }

  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <div className={className}>
          <TextInput
            {...field}
            type={type}
            placeholder={placeholder}
            description={description}
            label={label}
            disabled={disabled}
            error={meta.touched && meta.error && meta.error}
            required={required}
            // inputWrapperOrder={['label', 'input', 'description', 'error']}
            inputWrapperOrder={['label', 'description', 'input', 'error']}
          />
        </div>
      )}
    </Field>
  );
};
