import { ProjectCard } from '@/entities/Project';
import { useGetProjects } from '@/entities/Project/api/useGetProjects';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { CreateProjectButton } from '@/features/Project/CreateProject';
import { PermissionCode } from '@/shared/types/enums';
import { Grid, Paper, Text } from '@mantine/core';

export const ProjectsContainer = () => {
  const { data: projects } = useGetProjects();
  return (
    <Paper
      radius="md"
      p="md"
      mih="60vh"
      withBorder
    >
      <div className="flex items-center justify-between pb-4">
        <Text fw={600} size="lg">
          Projects
        </Text>
        <RequiredProjectPermissionsWrapper
          permissions={PermissionCode.PROJECT_CREATE}
        >
          <CreateProjectButton />
        </RequiredProjectPermissionsWrapper>
      </div>
      <Grid columns={4}>
        {(projects || [])?.map((project) => (
          <Grid.Col key={project.id} span={{ base: 4, sm: 2, lg: 1 }}>
            <ProjectCard project={project} />
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );
};
