import { ActionIcon as MantineActionButton, NumberInput } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { Field, type FieldProps } from "formik";
import { useEffect, useRef, type FC } from "react";

type NumberFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  isFastField?: boolean;
  min?: number;
  max?: number;
  allowedDecimalSeparators?: string[];
  rightSection?: React.ReactNode;
  clearable?: boolean;
  decimalScale?: number;
  description?: string;
  autoFocus?: boolean;
};

export const NumberField: FC<NumberFieldProps> = (props) => {
  const {
    name,
    label,
    placeholder,
    disabled,
    required,
    min,
    max,
    clearable,
    rightSection,
    decimalScale,
    allowedDecimalSeparators,
    className,
    description,
    autoFocus,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <Field name={name}>
      {({ field, meta, form: { setFieldValue } }: FieldProps) => (
        <div className={className}>
          <NumberInput
            {...field}
            ref={inputRef}
            // type="text"
            valueIsNumericString
            description={description}
            step={1}
            min={min}
            max={max}
            onChange={(value) => setFieldValue(name, value)}
            placeholder={placeholder}
            label={label}
            disabled={disabled}
            allowedDecimalSeparators={allowedDecimalSeparators}
            hideControls
            decimalScale={decimalScale}
            inputMode="decimal"
            rightSection={
              clearable ? (
                <MantineActionButton
                  type="button"
                  variant="transparent"
                  color="white.3"
                  onClick={() => setFieldValue(name, 0)}
                >
                  <IconX size={16} />
                </MantineActionButton>
              ) : (
                rightSection
              )
            }
            error={meta.touched && meta.error && meta.error}
            required={required}
            autoFocus={autoFocus}
          />
        </div>
      )}
    </Field>
  );
};
