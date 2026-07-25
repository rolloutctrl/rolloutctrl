import type { AssignVariantItem } from '../model/types';

export const makeEqualWeights = (count: number): number[] => {
  if (count === 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 - base * count;
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? base + remainder : base,
  );
};

export const redistributeWeights = (
  variants: AssignVariantItem[],
  pinnedIndex: number,
  pinnedWeight: number,
): AssignVariantItem[] => {
  const otherCount = variants.length - 1;
  const remaining = Math.max(0, 100 - pinnedWeight);
  const perOther = otherCount > 0 ? Math.floor(remaining / otherCount) : 0;
  return variants.map((v, i) =>
    i === pinnedIndex
      ? { ...v, weight: pinnedWeight }
      : { ...v, weight: perOther },
  );
};

export const recalculateWeights = (
  variants: AssignVariantItem[],
): AssignVariantItem[] => {
  const customIndices = variants
    .map((v, i) => ({ v, i }))
    .filter((x) => x.v.isCustomWeight);

  if (customIndices.length === 0) {
    const weights = makeEqualWeights(variants.length);
    return variants.map((v, i) => ({ ...v, weight: weights[i] }));
  }

  const totalCustomWeight = customIndices.reduce(
    (sum, x) => sum + x.v.weight,
    0,
  );
  const nonCustomCount = variants.length - customIndices.length;
  const remaining = Math.max(0, 100 - totalCustomWeight);
  const perNonCustom =
    nonCustomCount > 0 ? Math.floor(remaining / nonCustomCount) : 0;

  return variants.map((v) => {
    if (v.isCustomWeight) return v;
    return { ...v, weight: perNonCustom };
  });
};

export const recalculateAfterRemove = (
  variants: AssignVariantItem[],
): AssignVariantItem[] => {
  if (variants.length === 0) return [];
  return recalculateWeights(variants);
};
