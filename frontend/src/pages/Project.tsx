import { useGetProjectById } from '@/entities/Project';
import { ProjectOverviewView } from '@/widgets/Project/ProjectOverviewView';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

export const ProjectPage = () => {
  const { projectId } = useParams();
  const { data: project } = useGetProjectById(projectId);
  console.log(project, projectId);
  return (
    <>
      {project && (
        <Helmet>
          <title>{`RolloutCtrl - ${String(project.name)}`}</title>
        </Helmet>
      )}
      <ProjectOverviewView />
    </>
  );
};
