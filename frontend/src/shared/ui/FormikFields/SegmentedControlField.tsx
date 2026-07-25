import { SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { Field, type FieldProps } from 'formik';

type SegmentedControlFieldProps = SegmentedControlProps;

export const SegmentedControlField = (props: SegmentedControlFieldProps) => {
  const { data, color, name, ...restProps } = props;
  return (
    <Field name={name}>
      {({ field, form: { setFieldValue } }: FieldProps) => (
        <SegmentedControl
          {...restProps}
          color={color}
          value={field.value}
          data={data}
          onChange={(value) => name && setFieldValue(name, value)}
        />
      )}
    </Field>
  );
};
