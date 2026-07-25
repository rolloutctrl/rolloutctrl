import { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, Badge, Group, Stack, Text } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import { ActionStrategyItem } from './ActionStrategyItem';
import { EditActionModal } from '@/features/Action/EditAction';
import { DeleteActionDialog } from '@/features/Action/DeleteAction';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { PermissionCode } from '@/shared/types/enums';
import type { Action, ActionStrategyBasic } from '@/entities/Action';
import { useReorderActionStrategyApi } from '@/features/Action/ReorderActionStrategy';
import { useParams } from 'react-router-dom';

type ActionStrategyAccordionProps = {
  action: Action;
};

export const ActionStrategyAccordion = ({
  action,
}: ActionStrategyAccordionProps) => {
  const { projectId } = useParams();
  const [modalState, setModalState] = useState({
    openEditModal: false,
    openDeleteDialog: false,
  });

  const handleCloseModal = () =>
    setModalState({ openEditModal: false, openDeleteDialog: false });

  const sortedStrategies = useMemo(
    () => [...action.strategies].sort((a, b) => b.priority - a.priority),
    [action.strategies],
  );

  const [strategies, setStrategies] = useState<ActionStrategyBasic[]>(
    sortedStrategies,
  );
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setStrategies(sortedStrategies);
    }
  }, [sortedStrategies]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { mutateAsync: reorderActionStrategies } =
    useReorderActionStrategyApi(projectId);

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

    reorderActionStrategies({
      actionId: action.id,
      rules: updatedStrategies.map((s) => ({ id: s.id })),
      projectId,
    });
  };

  return (
    <>
      <Accordion
        variant="separated"
        radius="md"
        defaultValue="strategies"
        classNames={{
          item: 'dark:!bg-surface-dark',
        }}
      >
        <Accordion.Item value="strategies">
          <Accordion.Control component="div">
            <Group justify="space-between" pr="md">
              <div className="flex flex-row items-center gap-x-2">
                <IconBolt size={20} color="var(--mantine-color-yellow-6)" />
                <Text fw={500}>Strategies</Text>
              </div>
              <Badge size="sm" variant="light" color="gray">
                {strategies.length}{' '}
                {strategies.length === 1 ? 'strategy' : 'strategies'}
              </Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {strategies.length > 0 ? (
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
                      <ActionStrategyItem
                        strategy={strategy}
                        isDragging={draggedIndex === index}
                      />
                    </div>
                  </div>
                ))}
              </Stack>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-4">
                <Text c="dimmed" size="sm">
                  No strategies configured for this action
                </Text>
                <RequiredProjectPermissionsWrapper
                  permissions={PermissionCode.ACTION_UPDATE}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() =>
                      setModalState((s) => ({ ...s, openEditModal: true }))
                    }
                  >
                    Edit action to add strategies
                  </Text>
                </RequiredProjectPermissionsWrapper>
              </div>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <EditActionModal
        selectedAction={action}
        opened={modalState.openEditModal}
        onClose={handleCloseModal}
      />
      <DeleteActionDialog
        action={action}
        opened={modalState.openDeleteDialog}
        onClose={handleCloseModal}
        needRedirect
      />
    </>
  );
};
