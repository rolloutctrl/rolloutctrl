import { Form, Formik } from 'formik';
import { useEditVariantForm } from '../lib/useEditVariantForm';
import { Button, ColorInput, Group, Loader, Stack } from '@mantine/core';
import {
  // JsonInputField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/shared/ui';
import {
  payloadTypeOptions,
  variantColorsHex,
} from '@/shared/constants/consts';
// import { VariantPayloadType } from '@/shared/types/enums';
import { editVariantFormSchema } from '../lib/consts';
import { VariantPayloadField, type Variant } from '@/entities/Variant';

type EditVariantFormProps = {
  variant: Variant;
  onClose: () => void;
};

export const EditVariantForm = ({ variant, onClose }: EditVariantFormProps) => {
  const { initialValues, submitForm, isPending } = useEditVariantForm(
    variant,
    onClose,
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={submitForm}
      validationSchema={editVariantFormSchema}
      enableReinitialize
    >
      {({ values, setFieldValue, isValid }) => (
        <Form>
          <Stack gap="md">
            <TextField
              name="name"
              label="Variant name"
              description="Used as the variant identifier in your code"
              placeholder="e.g., Control, Variant A"
              disabled={isPending}
              required
            />

            <ColorInput
              label="Color tag"
              value={values.colorTag}
              onChange={(val) => setFieldValue('colorTag', val)}
              format="hex"
              disabled={isPending}
              withPicker={false}
              withEyeDropper={false}
              disallowInput
              swatches={variantColorsHex}
              required
            />

            <Group grow gap="md" align="start">
              <SelectField
                name="payloadType"
                label="Type"
                options={payloadTypeOptions}
                placeholder="Select type"
                disabled={isPending}
                checkIconPosition="right"
              />
              {/* {values.payloadType === VariantPayloadType.JSON ? (
                <JsonInputField
                  name="payload"
                  label="Payload"
                  placeholder='e.g., {"color": "blue"}'
                  disabled={isPending}
                />
              ) : (
                <TextField
                  name="payload"
                  label="Payload"
                  placeholder="e.g., checkout_v2"
                  disabled={isPending}
                />
              )} */}
              <VariantPayloadField
                payloadType={values.payloadType}
                isPending={isPending}
              />
            </Group>

            <TextAreaField
              name="description"
              label="Description (Optional)"
              placeholder="Optional description"
              disabled={isPending}
            />

            <div className="flex flex-row w-full items-center justify-end gap-x-2">
              <Button
                type="button"
                variant="light"
                color="gray"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="light"
                disabled={isPending || !isValid}
              >
                {isPending ? <Loader size="xs" color="white" /> : 'Save'}
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
