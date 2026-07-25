import { Field, type FieldProps } from "formik";
import { type FC, type ReactNode } from "react";

import { Select, type SelectProps } from "@mantine/core";
import type { Nullable, OptionSelect } from "@/shared/types/types";

type SelectFieldProps = SelectProps & {
  name: string;
  label?: string;
  options: OptionSelect[];
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  isSearchable?: boolean;
  disabled?: boolean;
  onCallBack?: (value: Nullable<string>) => void;
};

export const SelectField: FC<SelectFieldProps> = (props) => {
  const {
    name,
    label,
    options,
    icon,
    placeholder,
    isSearchable,
    disabled,
    required,
    onCallBack,
    ...selectProps
  } = props;

  const handleChange = (
    value: Nullable<string>,
    setFieldValue: (field: string, value: unknown) => void,
    setFieldTouched: (field: string, isTouched?: boolean) => void
  ) => {
    setFieldValue(name, value);
    setTimeout(() => setFieldTouched(name, true));
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onCallBack && onCallBack(value);
  };

  return (
    <Field name={name}>
      {({ field, form, meta }: FieldProps) => (
        <Select
          {...field}
          {...selectProps}
          label={label}
          data={options}
          onChange={(value) =>
            handleChange(value, form.setFieldValue, form.setFieldTouched)
          }
          searchable={isSearchable}
          leftSection={icon}
          disabled={disabled}
          placeholder={placeholder}
          classNames={{
            dropdown: "z-[1201]",
          }}
          comboboxProps={{ zIndex: 1201 }}
          required={required}
          withAsterisk={required}
          // inputWrapperOrder={['label', 'input', 'description', 'error']}
          inputWrapperOrder={['label', 'description', 'input', 'error']}
          error={meta.touched && meta.error}
        />
      )}
    </Field>
  );
};
