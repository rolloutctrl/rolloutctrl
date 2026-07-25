import { Field, type FieldProps } from 'formik';
import { Slider } from '@mantine/core';

type SliderFieldProps = {
  name: string;
  label?: string;
  marks: { value: number; label: string }[];
  min?: number;
  max?: number;
  disabled?: boolean;
};

export const SliderField = ({ name, label, marks, min, max, disabled }: SliderFieldProps) => {
  return (
    <Field name={name}>
      {({ field, form: { setFieldValue } }: FieldProps) => (
        <div style={{ paddingLeft: 12, paddingRight: 12 }}>
          <Slider
            {...field}
            label={label}
            value={field.value}
            onChange={(value) => setFieldValue(field.name, value)}
            marks={marks}
            min={min}
            max={max}
            size="sm"
            disabled={disabled}
            classNames={{
              markLabel: "!text-xs",
            }}
          />
        </div>
      )}
    </Field>
  );
};
