import { Field, type FieldProps } from "formik";
import { type FC } from "react";
import { Switch } from "@mantine/core";

type SwitchFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  color?: string;
  disabled?: boolean;
  isRequired?: boolean;
  defaultChecked?: boolean;
};

export const SwitchField: FC<SwitchFieldProps> = (props) => {
  const { name, label, disabled, isRequired, color, defaultChecked } =
    props;
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <Switch
          {...field}
          label={label}
          checked={field.value}
          color={color}
          defaultChecked={defaultChecked}
          disabled={disabled}
          withThumbIndicator={false}
          error={meta.touched && meta.error}
          required={isRequired}
        />
      )}
    </Field>
  );
};
