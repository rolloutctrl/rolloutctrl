import { payloadBooleanOptions } from "@/shared/constants/consts";
import { VariantPayloadType } from "@/shared/types/enums";
import { JsonInputField, NumberField, SelectField, TextField } from "@/shared/ui";

export const VariantPayloadField = ({
  payloadType,
  isPending,
}: {
  payloadType: VariantPayloadType;
  isPending: boolean;
}) => {
  switch (payloadType) {
    case VariantPayloadType.JSON:
      return (
        <JsonInputField
          name="payload"
          label="Payload (Optional)"
          placeholder='e.g., {"color": "blue"}'
          disabled={isPending}
        />
      );
    case VariantPayloadType.STRING:
      return (
        <TextField
          name="payload"
          label="Payload (Optional)"
          placeholder="e.g., checkout_v2"
          disabled={isPending}
        />
      );
    case VariantPayloadType.BOOLEAN:
      return (
        <SelectField
          name="payload"
          label="Payload (Optional)"
          placeholder="e.g., true, false"
          disabled={isPending}
          options={payloadBooleanOptions}
          checkIconPosition="right"
        />
      );
    case VariantPayloadType.NUMBER:
      return (
        <NumberField
          name="payload"
          label="Payload (Optional)"
          placeholder="e.g., 1, 2, 3"
          disabled={isPending}
        />
      );
    default:
      return null;
  }
};