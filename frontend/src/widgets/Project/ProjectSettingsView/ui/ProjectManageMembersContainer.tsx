import { useGetProjectMembers } from '@/entities/Project';
import { useGetCurrentUser } from '@/entities/User';
import { EditProjectMemberAccessCollapse } from '@/features/Project/EditProjectMemberAccess';
import { Center, Group, Loader, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export const ProjectManageMembersContainer = () => {
  const { projectId } = useParams();
  const { data: currentUser } = useGetCurrentUser();
  const {
    data: projectMembers,
    isLoading,
    isError,
  } = useGetProjectMembers(projectId);

  if (isLoading) {
    return (
      <Center p="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center p="xl">
        <Text c="red">Failed to load project members</Text>
      </Center>
    );
  }
  return (
    <Group gap={0}>
      {projectMembers?.map((member) => (
        <EditProjectMemberAccessCollapse
          key={member.id}
          projectMember={member}
          currentUserId={currentUser?.id || ''}
        />
      ))}
    </Group>
  );
};
