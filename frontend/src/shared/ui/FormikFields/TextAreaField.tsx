import { Textarea } from "@mantine/core";
import { Field, type FieldProps } from "formik";
import {
  type Ref,
  type FC,
  forwardRef,
  type TextareaHTMLAttributes,
  type RefAttributes,
} from "react";

type TextAreaFieldProps = {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement> &
  RefAttributes<HTMLTextAreaElement>;

export const TextAreaField: FC<TextAreaFieldProps> = forwardRef(
  (props, ref: Ref<HTMLTextAreaElement>) => {
    const {
      name,
      label,
      description,
      placeholder,
      disabled,
      required,
      rows,
      ...rest
    } = props;

    return (
      <Field name={name}>
        {({ field, meta }: FieldProps) => (
          <Textarea
            {...field}
            ref={ref}
            value={field.value ? field.value : ""}
            placeholder={placeholder}
            description={description}
            label={label}
            disabled={disabled}
            error={meta.touched && meta.error}
            required={required}
            // inputWrapperOrder={['label', 'input', 'description', 'error']}
            inputWrapperOrder={['label', 'description', 'input', 'error']}
            withAsterisk={required}
            rows={rows}
            {...rest}
          />
        )}
      </Field>
    );
  }
);
