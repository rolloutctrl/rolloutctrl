import { TagsInput } from '@mantine/core';
import { Field, type FieldProps } from 'formik';

type TagsInputFieldProps = {
  name: string;
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  maxTags?: number;
  allowDuplicates?: boolean;
  required?: boolean;
};

export const TagsInputField = ({
  name,
  label,
  description,
  className,
  placeholder,
  clearable,
  disabled,
  maxTags,
  allowDuplicates = false,
  required,
}: TagsInputFieldProps) => {
  return (
    <Field name={name}>
      {({ field: { value }, form: { setFieldValue }, meta }: FieldProps) => (
        <div className={className}>
          <TagsInput
            name={name}
            value={Array.isArray(value) ? value : []}
            label={label}
            onChange={(val) => setFieldValue(name, val)}
            placeholder={placeholder}
            description={description}
            clearable={clearable}
            disabled={disabled}
            maxTags={maxTags}
            allowDuplicates={allowDuplicates}
            inputWrapperOrder={['label', 'description', 'input', 'error']}
            required={required}
            error={meta.touched && meta.error}
            classNames={{
              input: '!min-h-[4rem]',
            }}
            data={[]}
          />
        </div>
      )}
    </Field>
  );
};
