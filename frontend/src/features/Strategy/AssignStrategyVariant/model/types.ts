import type { VariantPayloadType } from '@/shared/types/enums';
import type { Variant } from '@/entities/Variant';

export type AssignVariantItem = {
  variantId?: string;
  variant?: Variant;

  name?: string;
  description?: string;
  payloadType?: VariantPayloadType;
  payload?: string;
  colorTag?: string;

  weight: number;
  isCustomWeight: boolean;
};

export type AssignStrategyVariantFormProps = {
  strategyId?: string;
  featureFlagId?: string;
  projectId?: string;
  disabled?: boolean;
  variants?: AssignVariantItem[];
  onChange?: (variants: AssignVariantItem[]) => void;
};
