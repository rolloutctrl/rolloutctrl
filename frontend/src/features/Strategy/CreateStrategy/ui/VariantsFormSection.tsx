// import { type FC } from 'react';
// import { useFormikContext } from 'formik';
// import {
//   ActionIcon,
//   Button,
//   Group,
//   NumberInput,
//   Paper,
//   Progress,
//   Stack,
//   Switch,
//   Text,
// } from '@mantine/core';
// import { IconPlus, IconTrash } from '@tabler/icons-react';
// import type {
//   CreateStrategyFormState,
//   CreateStrategyVariantFormState,
// } from '../model/types';
// import { JsonInputField, TextAreaField, TextField } from '@/shared/ui';
// import { SelectField } from '@/shared/ui/FormikFields/SelectField';
// import { payloadTypeOptions } from '@/shared/constants/consts';
// import { VariantPayloadType } from '@/shared/types/enums';

// const VARIANT_COLORS = [
//   'cyan',
//   'pink',
//   'orange',
//   'grape',
//   'teal',
//   'yellow',
//   'indigo',
//   'lime',
// ];

// const makeEqualWeights = (count: number): number[] => {
//   if (count === 0) return [];
//   const base = Math.floor(100 / count);
//   const remainder = 100 - base * count;
//   return Array.from({ length: count }, (_, i) =>
//     i === 0 ? base + remainder : base,
//   );
// };

// const redistributeAround = (
//   variants: CreateStrategyVariantFormState[],
//   pinnedIndex: number,
//   pinnedWeight: number,
// ): CreateStrategyVariantFormState[] => {
//   const otherCount = variants.length - 1;
//   const remaining = Math.max(0, 100 - pinnedWeight);
//   const perOther = otherCount > 0 ? Math.floor(remaining / otherCount) : 0;
//   return variants.map((v, i) =>
//     i === pinnedIndex
//       ? { ...v, weight: pinnedWeight }
//       : { ...v, weight: perOther },
//   );
// };

// type VariantsFormSectionProps = {
//   disabled?: boolean;
// };

// export const VariantsFormSection: FC<VariantsFormSectionProps> = ({
//   disabled,
// }) => {
//   const { values, setFieldValue } = useFormikContext<CreateStrategyFormState>();
//   const variants = values.variants ?? [];

//   const totalWeight = variants.reduce((sum, v) => sum + (v.weight ?? 0), 0);
//   const pinnedIndex = variants.findIndex((v) => v.isDefault);

//   const handleAdd = () => {
//     const newCount = variants.length + 1;
//     let newVariants: CreateStrategyVariantFormState[];

//     const blank: CreateStrategyVariantFormState = {
//       name: '',
//       description: '',
//       weight: 0,
//       payload: '',
//       payloadType: VariantPayloadType.STRING,
//       isDefault: false,
//     };

//     if (pinnedIndex !== -1) {
//       const fixedWeight = variants[pinnedIndex].weight;
//       const otherCount = newCount - 1;
//       const perOther = Math.floor(Math.max(0, 100 - fixedWeight) / otherCount);
//       newVariants = [
//         ...variants.map((v, i) =>
//           i === pinnedIndex ? v : { ...v, weight: perOther },
//         ),
//         { ...blank, weight: perOther },
//       ];
//     } else {
//       const weights = makeEqualWeights(newCount);
//       newVariants = [
//         ...variants.map((v, i) => ({ ...v, weight: weights[i] })),
//         { ...blank, weight: weights[newCount - 1] },
//       ];
//     }

//     setFieldValue('variants', newVariants);
//   };

//   const handleRemove = (index: number) => {
//     const remaining = variants.filter((_, i) => i !== index);
//     if (remaining.length === 0) {
//       setFieldValue('variants', []);
//       return;
//     }

//     const newPinnedIndex = remaining.findIndex((v) => v.isDefault);
//     if (newPinnedIndex !== -1) {
//       setFieldValue(
//         'variants',
//         redistributeAround(
//           remaining,
//           newPinnedIndex,
//           remaining[newPinnedIndex].weight,
//         ),
//       );
//     } else {
//       const weights = makeEqualWeights(remaining.length);
//       setFieldValue(
//         'variants',
//         remaining.map((v, i) => ({ ...v, weight: weights[i] })),
//       );
//     }
//   };

//   const handleIsDefaultToggle = (index: number, checked: boolean) => {
//     if (checked) {
//       setFieldValue(
//         'variants',
//         redistributeAround(
//           variants.map((v) => ({ ...v, isDefault: false })),
//           index,
//           variants[index].weight,
//         ).map((v, i) => (i === index ? { ...v, isDefault: true } : v)),
//       );
//     } else {
//       const weights = makeEqualWeights(variants.length);
//       setFieldValue(
//         'variants',
//         variants.map((v, i) => ({
//           ...v,
//           isDefault: false,
//           weight: weights[i],
//         })),
//       );
//     }
//   };

//   const handleWeightChange = (index: number, val: string | number) => {
//     const newWeight = Number(val);
//     if (variants[index].isDefault) {
//       setFieldValue(
//         'variants',
//         redistributeAround(variants, index, newWeight).map((v, i) =>
//           i === index ? { ...v, isDefault: true } : v,
//         ),
//       );
//     } else {
//       setFieldValue(`variants.${index}.weight`, newWeight);
//     }
//   };

//   return (
//     <Stack gap="sm">
//       {variants.length > 0 ? (
//         variants.map((variant, index) => (
//           <Paper
//             key={index}
//             p="sm"
//             radius="md"
//             withBorder
//             className="bg-gray-100 dark:bg-dark-bg"
//           >
//             <Stack gap="xs">
//               <Group justify="space-between">
//                 <Group gap="xs">
//                   <div
//                     style={{
//                       width: 10,
//                       height: 10,
//                       borderRadius: '50%',
//                       backgroundColor: `var(--mantine-color-${VARIANT_COLORS[index % VARIANT_COLORS.length]}-5)`,
//                     }}
//                   />
//                   <Text component="span" fw={500} size="md">
//                     Variant {index + 1}
//                   </Text>
//                 </Group>
//                 <ActionIcon
//                   color="red"
//                   variant="subtle"
//                   onClick={() => handleRemove(index)}
//                   disabled={disabled}
//                 >
//                   <IconTrash size={16} />
//                 </ActionIcon>
//               </Group>

//               <div className="flex flex-row w-full items-end gap-4 flex-grow">
//                 <TextField
//                   name={`variants.${index}.name`}
//                   label="Variant name"
//                   description="This will be used as the variant identifier in your code"
//                   placeholder="e.g., Control, Variant A"
//                   disabled={disabled}
//                   required
//                   className="grow"
//                 />
//                 <Group align="flex-end" gap="md">
//                   <NumberInput
//                     label="Weight (%)"
//                     value={variant.weight}
//                     onChange={(val) => handleWeightChange(index, val)}
//                     min={0}
//                     max={100}
//                     suffix="%"
//                     disabled={disabled || !variant.isDefault}
//                     style={{ width: 140 }}
//                   />
//                   <div className="flex items-center pb-[9px]">
//                     <Switch
//                       label="Custom percentage"
//                       checked={variant.isDefault}
//                       onChange={(e) =>
//                         handleIsDefaultToggle(index, e.currentTarget.checked)
//                       }
//                       disabled={disabled}
//                       withThumbIndicator={false}
//                     />
//                   </div>
//                 </Group>
//               </div>

//               <Group grow gap="md" align="start">
//                 <SelectField
//                   name={`variants.${index}.payloadType`}
//                   label="Type"
//                   options={payloadTypeOptions}
//                   placeholder="Select type"
//                   disabled={disabled}
//                   required
//                 />
//                 {variant.payloadType === VariantPayloadType.JSON ? (
//                   <JsonInputField
//                     name={`variants.${index}.payload`}
//                     label="Payload"
//                     placeholder='e.g., {"color": "blue"}'
//                     disabled={disabled}
//                     required
//                   />
//                 ) : (
//                   <TextField
//                     name={`variants.${index}.payload`}
//                     label="Payload"
//                     placeholder="e.g., checkout_v2"
//                     disabled={disabled}
//                     required
//                   />
//                 )}
//               </Group>

//               <TextAreaField
//                 name={`variants.${index}.description`}
//                 label="Description (Optional)"
//                 placeholder="Optional description"
//                 disabled={disabled}
//               />
//             </Stack>
//           </Paper>
//         ))
//       ) : (
//         <Text size="sm" c="dimmed" ta="center">
//           No variants added yet
//         </Text>
//       )}

//       <Button
//         variant="outline"
//         leftSection={<IconPlus size={16} />}
//         onClick={handleAdd}
//         disabled={disabled}
//       >
//         Add Variant
//       </Button>

//       {variants.length > 0 && (
//         <div>
//           <Group justify="space-between" mb={6}>
//             <Text size="xs" c="dimmed" fw={500}>
//               Weight distribution
//             </Text>
//             <Text size="xs" fw={600} c={totalWeight === 100 ? 'dimmed' : 'red'}>
//               Total: {totalWeight}%
//             </Text>
//           </Group>
//           <Progress.Root size="xl">
//             {variants.map((variant, index) => (
//               <Progress.Section
//                 key={index}
//                 value={variant.weight}
//                 color={VARIANT_COLORS[index % VARIANT_COLORS.length]}
//               >
//                 {variant.weight >= 8 && (
//                   <Progress.Label>
//                     {variant.name || `V${index + 1}`}
//                   </Progress.Label>
//                 )}
//               </Progress.Section>
//             ))}
//           </Progress.Root>
//           <Group gap="xs" mt={8} wrap="wrap">
//             {variants.map((variant, index) => (
//               <Group key={index} gap={4}>
//                 <div
//                   style={{
//                     width: 8,
//                     height: 8,
//                     borderRadius: '50%',
//                     backgroundColor: `var(--mantine-color-${VARIANT_COLORS[index % VARIANT_COLORS.length]}-5)`,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <Text size="xs" c="dimmed">
//                   {variant.name || `Variant ${index + 1}`}: {variant.weight}%
//                 </Text>
//               </Group>
//             ))}
//           </Group>
//         </div>
//       )}
//     </Stack>
//   );
// };
