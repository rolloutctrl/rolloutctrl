import type { VariantPayloadType } from "@/shared/types/enums";

export type CreateVariantFormState = {
  name: string;
  description?: string;
  payloadType: VariantPayloadType;
  payload?: string;
  colorTag: string;
  projectId: string;
  featureFlagId: string;
};