import type { OptionSelect } from "@/shared/types/types";
import { Field, type FieldProps } from "formik";
import { type FC, type ReactNode } from "react";
import { MultiSelect } from "../MultiSelect";

type MultiSelectFieldProps = {
  name: string;
  label?: string;
  options: OptionSelect[];
  icon?: ReactNode;
  placeholder?: string;
  description?: string;
  className?: string;
  maxSelections?: number;
  isSearchable?: boolean;
  disabled?: boolean;
  nothingFound?: ReactNode;
  required?: boolean;
  clearable?: boolean;
  dropdownOpened?: boolean;
  onRemove?: (value: string) => void;
};

export const MultiSelectField: FC<MultiSelectFieldProps> = (props) => {
  const {
    name,
    label,
    options,
    icon,
    placeholder,
    description,
    maxSelections,
    isSearchable,
    disabled,
    nothingFound,
    required,
    clearable,
    dropdownOpened,
    onRemove,
  } = props;
  return (
    <Field name={name}>
      {({ field, form, meta }: FieldProps) => (
        <MultiSelect
          {...field}
          name={name}
          label={label}
          options={options}
          setSelectedValues={(value) => form.setFieldValue(name, value)}
          isSearchable={isSearchable}
          maxSelections={maxSelections}
          icon={icon}
          description={description}
          onRemove={onRemove}
          placeholder={placeholder}
          disabled={disabled}
          dropdownOpened={dropdownOpened}
          nothingFound={nothingFound}
          error={meta.touched && meta.error}
          isRequired={required}
          clearable={clearable}
        />
      )}
    </Field>
  );
};
