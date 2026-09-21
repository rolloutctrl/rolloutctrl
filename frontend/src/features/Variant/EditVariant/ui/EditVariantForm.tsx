import { Form, Formik } from 'formik';
import { useEditVariantForm } from '../lib/useEditVariantForm';
import { Button, ColorInput, Grid, Loader, Stack } from '@mantine/core';
import { SelectField, TextAreaField, TextField } from '@/shared/ui';
import {
  payloadTypeOptions,
  variantColorsHex,
} from '@/shared/constants/consts';
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

            <Grid columns={12}>
              <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
                <SelectField
                  name="payloadType"
                  label="Type"
                  options={payloadTypeOptions}
                  placeholder="Select type"
                  disabled={isPending}
                  checkIconPosition="right"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 12, lg: 6 }} ta="left">
                <VariantPayloadField
                  payloadType={values.payloadType}
                  isPending={isPending}
                />
              </Grid.Col>
            </Grid>

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
