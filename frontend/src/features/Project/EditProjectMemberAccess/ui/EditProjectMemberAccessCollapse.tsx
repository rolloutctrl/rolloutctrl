import {
  UnstyledButton,
  Collapse,
  Group,
  Avatar,
  Text,
  Badge,
  Card,
} from '@mantine/core';
import { EditProjectMemberAccessForm } from './EditProjectMemberAccessForm';
import type { ProjectMember } from '@/entities/Project';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { TeamRole } from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';

type EditProjectMemberAccessCollapseProps = {
  projectMember: Nullable<ProjectMember>;
  currentUserId?: string;
};

export const EditProjectMemberAccessCollapse = ({
  projectMember,
  currentUserId,
}: EditProjectMemberAccessCollapseProps) => {
  const [expanded, handlers] = useDisclosure(false);
  return (
    <Card p={0} radius={0} withBorder className="flex flex-col w-full items-start rounded-none first:!rounded-t-lg last:!rounded-b-lg not-first:!mt-[-1px]">
      <UnstyledButton
        onClick={handlers.toggle}
        className="flex flex-row w-full !px-4 !py-2"
      >
        <div className="flex flex-row w-full justify-between items-center">
          <Group>
            <Avatar src={projectMember?.user?.avatar} size={30} radius="xl" />

            <div className="flex flex-col items-start">
              <div className="flex flex-row items-center gap-x-2">
                <Text size="sm" fw={500}>
                  {projectMember?.user?.name}
                </Text>
                <Badge
                  size="xs"
                  variant="dot"
                  color={
                    projectMember?.role === TeamRole.OWNER
                      ? 'rollout'
                      : 'orange'
                  }
                >
                  {projectMember?.role}
                </Badge>
              </div>

              <Text c="dimmed" size="xs">
                {projectMember?.user?.email}
              </Text>
            </div>
          </Group>
          <Group>
            {currentUserId === projectMember?.user?.id ? (
              <Text c="dimmed" size="xs">
                It&apos;s you
              </Text>
            ) : null}
            {expanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </Group>
        </div>
      </UnstyledButton>

      <Collapse
        expanded={expanded}
        className="!px-4 pb-4 w-full"
      >
        <EditProjectMemberAccessForm
          projectMember={projectMember}
          currentUserId={currentUserId}
        />
      </Collapse>
    </Card>
  );
};
