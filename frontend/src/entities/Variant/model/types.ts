import type { Strategy } from "@/entities/Strategy";
import type { VariantPayloadType } from "@/shared/types/enums";

export type Variant = {
  id: string;
  name: string;
  description?: string;

  payloadType?: VariantPayloadType;
  payload?: string;

  colorTag: string;

  featureFlagId: string;

  strategyVariants: StrategyVariant[];

  createdAt: Date;
  updatedAt: Date;
}

export type StrategyVariant = {
  id: string;
  strategyId: string;
  variantId: string;
  weight: number;
  isCustomWeight: boolean;

  strategy: Strategy;
  variant: Variant;

  createdAt: Date;
  updatedAt: Date;
}
