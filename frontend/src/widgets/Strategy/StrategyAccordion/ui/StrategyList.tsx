import { useEffect, useMemo, useRef, useState } from 'react';
import { Stack, Text, Badge, useMantineColorScheme } from '@mantine/core';
import type { FeatureFlagEnvironment } from '@/entities/FeatureFlagEnvironment';
import type { Strategy } from '@/entities/Strategy';
import { StrategyItem } from './StrategyItem';
import { useReorderStrategyApi } from '@/features/Strategy/ReorderStrategy';
import type { Nullable } from '@/shared/types/types';
import { DeleteStrategyDialog } from '@/features/Strategy/DeleteStrategy';
import { validateStrategies } from '../lib/validateStrategies';
import { StrategyValidationBanner } from './StrategyValidationBanner';
import { useParams } from 'react-router-dom';

type StrategyListProps = {
  featureFlagEnvironment: FeatureFlagEnvironment;
  addStrategyButtonSlot?: React.ReactNode;
  onStrategiesChange?: (strategies: Strategy[]) => void;
};

export const StrategyList = ({
  featureFlagEnvironment,
  addStrategyButtonSlot,
  onStrategiesChange,
}: StrategyListProps) => {
  const { colorScheme } = useMantineColorScheme();
  const { projectId } = useParams();
  const sortedStrategies = useMemo(
    () =>
      [...featureFlagEnvironment.strategies].sort(
        (a, b) => b.priority - a.priority,
      ),
    [featureFlagEnvironment.strategies],
  );

  const [strategies, setStrategies] = useState<Strategy[]>(sortedStrategies);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setStrategies(sortedStrategies);
      onStrategiesChange?.(sortedStrategies);
    }
  }, [sortedStrategies, onStrategiesChange]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] =
    useState<Nullable<Strategy>>(null);
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });

  const handleOpenModal = (value: boolean, modalName: string) =>
    setModalState({ ...modalState, [modalName]: value });

  const handleCloseModal = () => {
    setModalState({
      openEditModal: false,
      openDeleteDialog: false,
    });
    const t = setTimeout(() => {
      setSelectedStrategy(null);
    }, 500);
    return clearTimeout(t);
  };

  // const handleOpenEdit = (strategy: Strategy) => {
  //   setSelectedStrategy(strategy);
  //   handleOpenModal(true, 'openEditModal');
  // };

  const handleOpenDelete = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    handleOpenModal(true, 'openDeleteDialog');
  };


  const { mutateAsync: reorderStrategies } = useReorderStrategyApi(
    projectId,
    featureFlagEnvironment.featureFlag?.key,
  );

  const handleDragStart = (index: number) => {
    isDraggingRef.current = true;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = Array.from(strategies);
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setStrategies(items);
  };

  const handleDragEnd = () => {
    if (draggedIndex === null) return;

    const updatedStrategies = strategies.map((strategy, index) => ({
      ...strategy,
      priority: strategies.length - 1 - index,
    }));

    isDraggingRef.current = false;
    setStrategies(updatedStrategies);
    setDraggedIndex(null);
    onStrategiesChange?.(updatedStrategies);

    reorderStrategies({
      featureFlagEnvironmentId: featureFlagEnvironment.id,
      rules: updatedStrategies.map((s) => ({ id: s.id })),
      projectId,
      flagId: featureFlagEnvironment.featureFlagId,
    });
  };

  const activeStrategies = useMemo(
    () => strategies.filter((s) => s.enabled !== false),
    [strategies],
  );

  const validationIssues = useMemo(
    () => validateStrategies(featureFlagEnvironment.enabled, activeStrategies),
    [featureFlagEnvironment.enabled, activeStrategies],
  );

  if (!strategies.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <Text c="dimmed" size="sm">
          No strategies configured for this environment
        </Text>
        {addStrategyButtonSlot}
      </div>
    );
  }

  return (
    <>
      <StrategyValidationBanner
        issues={validationIssues}
        strategyCount={activeStrategies.length}
      />
      <Stack gap="xs">
        {strategies.map((strategy, index) => (
          <div key={strategy.id}>
            {index > 0 && (
              <div className="flex justify-center pb-2">
                <Badge size="sm" variant="light" color="gray" radius="sm">
                  OR
                </Badge>
              </div>
            )}
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <StrategyItem
                strategy={strategy}
                colorScheme={colorScheme}
                isDragging={draggedIndex === index}
                onDeleteStrategy={handleOpenDelete}
              />
            </div>
          </div>
        ))}
        {addStrategyButtonSlot && (
          <div className="flex flex-row w-full items-center justify-center py-4">
            {addStrategyButtonSlot}
          </div>
        )}
      </Stack>
      <DeleteStrategyDialog
        strategy={selectedStrategy}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
      />
    </>
  );
};
