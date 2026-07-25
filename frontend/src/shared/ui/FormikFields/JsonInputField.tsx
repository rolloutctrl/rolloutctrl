import { JsonInput, type JsonInputProps } from '@mantine/core';
import { Field, type FieldProps } from 'formik';

type JsonInputFieldProps = JsonInputProps;

export const JsonInputField = (props: JsonInputFieldProps) => {
  const { name, ...restProps } = props;
  return (
    <Field name={name}>
      {({ field, form: { setFieldValue } }: FieldProps) => (
        <JsonInput
          {...restProps}
          value={field.value ?? ''}
          onChange={(value) => name && setFieldValue(name, value)}
          validationError="Invalid JSON"
          formatOnBlur
          autosize
        />
      )}
    </Field>
  );
};
