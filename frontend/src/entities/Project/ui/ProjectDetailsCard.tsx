import { Card, Skeleton, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useGetProjectById } from '../api/useGetProjectById';

type ProjectDetailsCardProps = {
  tabList?: React.ReactNode;
};

export const ProjectDetailsCard = ({ tabList }: ProjectDetailsCardProps) => {
  const { projectId } = useParams();

  const { data: project, isLoading } = useGetProjectById(projectId);

  if (isLoading) {
    return (
      <Card p="lg" radius="md">
        <div className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-col items-start">
            <Skeleton width={200} height={24} />
            <Skeleton width={400} height={10} />
            <Skeleton width={350} height={10} />
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card p={0} radius="md">
      <div className="flex flex-row items-center justify-between p-4">
        <div className="flex flex-col items-start">
          <Text fw={700} size="lg" ta="left" className='space-grotesk-bold'>
            {project?.name}
          </Text>
          <Text size="sm" ta="left">
            {project?.description ?? 'No description'}
          </Text>
        </div>
      </div>
      {tabList}
    </Card>
  );
};
