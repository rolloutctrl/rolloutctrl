import { type FC, useCallback, useMemo, useEffect, useState } from 'react';
import { Modal, Stack, Text } from '@mantine/core';
import {
  useGetStrategyVariants,
  useGetVariantsByFlagId,
} from '@/entities/Variant';
import type {
  AssignVariantItem,
  AssignStrategyVariantFormProps,
} from '../model/types';
// import { VARIANT_COLOR_TAGS } from '../lib/consts';
import { recalculateWeights, recalculateAfterRemove } from '../lib/utils';
import {
  useAddVariantToStrategy,
  useUpdateStrategyVariant,
  useRemoveVariantFromStrategy,
  // buildCreatePayload,
} from '../api/useStrategyVariantApi';
import { VariantCard } from './VariantCard';
import { AddVariantControl } from './AddVariantControl';
import { WeightDistributionBar } from './WeightDistributionBar';
import { CreateVariantForm } from '@/features/Variant/CreateVariant';

const strategyVariantToItem = (sv: {
  variantId: string;
  weight: number;
  isCustomWeight: boolean;
  variant: AssignVariantItem['variant'];
}): AssignVariantItem => ({
  variantId: sv.variantId,
  variant: sv.variant,
  colorTag: sv.variant?.colorTag,
  weight: sv.weight,
  isCustomWeight: sv.isCustomWeight,
});

export const AssignStrategyVariantForm: FC<AssignStrategyVariantFormProps> = ({
  strategyId,
  featureFlagId,
  projectId,
  disabled,
  variants: controlledVariants,
  onChange,
}) => {
  const isDirectMode = !!strategyId;

  const { data: strategyVariantsData } = useGetStrategyVariants(strategyId);
  const addMutation = useAddVariantToStrategy(strategyId);
  const updateMutation = useUpdateStrategyVariant(strategyId);
  const removeMutation = useRemoveVariantFromStrategy(strategyId);

  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const { data: existingVariants } = useGetVariantsByFlagId(
    featureFlagId,
    projectId,
  );

  const directVariants = useMemo<AssignVariantItem[]>(() => {
    if (!isDirectMode || !strategyVariantsData) return [];
    return strategyVariantsData.map(strategyVariantToItem);
  }, [isDirectMode, strategyVariantsData]);

  const variants = useMemo<AssignVariantItem[]>(
    () => (isDirectMode ? directVariants : (controlledVariants ?? [])),
    [isDirectMode, directVariants, controlledVariants],
  );

  const currentVariantIds = useMemo(
    () => variants.map((v) => v.variantId).filter(Boolean) as string[],
    [variants],
  );

  const notifyChange = useCallback(
    (newVariants: AssignVariantItem[]) => {
      if (!isDirectMode && onChange) {
        onChange(newVariants);
      }
    },
    [isDirectMode, onChange],
  );

  // Sync initial empty state for pre-creation mode
  useEffect(() => {
    if (!isDirectMode && !controlledVariants && onChange) {
      onChange([]);
    }
  }, [isDirectMode, controlledVariants, onChange]);

  const handleAddExisting = useCallback(
    (variantId: string) => {
      const existing = existingVariants?.find((v) => v.id === variantId);
      if (!existing) return;

      const newItem: AssignVariantItem = {
        variantId: existing.id,
        variant: existing,
        colorTag: existing.colorTag,
        weight: 0,
        isCustomWeight: false,
      };

      const newVariants = [...variants, newItem];
      const recalculated = recalculateWeights(newVariants);

      if (isDirectMode && strategyId) {
        addMutation.mutate({
          variantId: existing.id,
          weight: recalculated[recalculated.length - 1].weight,
          isCustomWeight: false,
        });
      } else {
        notifyChange(recalculated);
      }
    },
    [
      existingVariants,
      variants,
      isDirectMode,
      strategyId,
      addMutation,
      notifyChange,
    ],
  );

  const handleCreateNew = () => setIsOpenCreate(true);

  const handleCloseModal = () => setIsOpenCreate(false);

  const handleRemove = useCallback(
    (index: number) => {
      const removed = variants[index];
      const remaining = variants.filter((_, i) => i !== index);
      const recalculated = recalculateAfterRemove(remaining);

      if (isDirectMode && strategyId && removed.variantId) {
        removeMutation.mutate(removed.variantId);
      } else {
        notifyChange(recalculated);
      }
    },
    [variants, isDirectMode, strategyId, removeMutation, notifyChange],
  );

  const handleWeightChange = useCallback(
    (index: number, weight: number) => {
      if (variants[index].isCustomWeight) {
        const newVariants = variants.map((v, i) =>
          i === index ? { ...v, weight } : v,
        );
        const recalculated = recalculateWeights(newVariants);
        if (isDirectMode && strategyId && variants[index].variantId) {
          updateMutation.mutate({
            variantId: variants[index].variantId!,
            payload: { weight, isCustomWeight: true },
          });
        } else {
          notifyChange(recalculated);
        }
      } else {
        const newVariants = variants.map((v, i) =>
          i === index ? { ...v, weight } : v,
        );
        notifyChange(newVariants);
      }
    },
    [variants, isDirectMode, strategyId, updateMutation, notifyChange],
  );

  const handleCustomWeightToggle = useCallback(
    (index: number, checked: boolean) => {
      if (checked) {
        const newVariants = variants.map((v, i) => ({
          ...v,
          isCustomWeight: i === index,
        }));
        const recalculated = recalculateWeights(newVariants);

        if (isDirectMode && strategyId) {
          variants.forEach((v, i) => {
            if (i === index && v.variantId) {
              updateMutation.mutate({
                variantId: v.variantId,
                payload: {
                  weight: recalculated[index].weight,
                  isCustomWeight: true,
                },
              });
            } else if (i !== index && v.isCustomWeight && v.variantId) {
              updateMutation.mutate({
                variantId: v.variantId,
                payload: {
                  weight: recalculated[i].weight,
                  isCustomWeight: false,
                },
              });
            }
          });
        } else {
          notifyChange(recalculated);
        }
      } else {
        const newVariants = variants.map((v, i) =>
          i === index ? { ...v, isCustomWeight: false } : v,
        );
        const recalculated = recalculateWeights(newVariants);

        if (isDirectMode && strategyId && variants[index].variantId) {
          updateMutation.mutate({
            variantId: variants[index].variantId!,
            payload: {
              weight: recalculated[index].weight,
              isCustomWeight: false,
            },
          });
        } else {
          notifyChange(recalculated);
        }
      }
    },
    [variants, isDirectMode, strategyId, updateMutation, notifyChange],
  );

  const handleFieldChange = useCallback(
    (index: number, field: keyof AssignVariantItem, value: string) => {
      const newVariants = variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      );
      notifyChange(newVariants);
    },
    [variants, notifyChange],
  );

  const isMutating =
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending;
  const isDisabled = disabled || (isDirectMode && isMutating);

  return (
    <>
      <Stack gap="sm">
        {variants.length > 0 ? (
          variants.map((variant, index) => (
            <VariantCard
              key={variant.variantId ?? `new-${index}`}
              variant={variant}
              index={index}
              disabled={isDisabled}
              isNew={!variant.variantId}
              onRemove={handleRemove}
              onWeightChange={handleWeightChange}
              onCustomWeightToggle={handleCustomWeightToggle}
              onFieldChange={handleFieldChange}
            />
          ))
        ) : (
          <Text size="sm" c="dimmed" ta="center">
            No variants added yet
          </Text>
        )}

        <AddVariantControl
          existingVariants={existingVariants ?? []}
          currentVariantIds={currentVariantIds}
          currentCount={variants.length}
          disabled={isDisabled}
          onSelectExisting={handleAddExisting}
          onCreateNew={handleCreateNew}
        />
        {isDirectMode && (
          <Text size="sm" c="dimmed" ta="center">
            Any changes to variants are automatically applied to this strategy
            without requiring an additional save.
          </Text>
        )}

        {variants.length > 0 && <WeightDistributionBar variants={variants} />}
      </Stack>
      <Modal
        opened={isOpenCreate}
        onClose={handleCloseModal}
        title="Add Variants"
        closeOnClickOutside={false}
        size="lg"
      >
        <CreateVariantForm onClose={handleCloseModal} />
      </Modal>
    </>
  );
};
