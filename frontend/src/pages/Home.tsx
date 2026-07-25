import { ProjectsContainer } from '@/widgets/Project/ProjectsContainer';
import { Helmet } from 'react-helmet-async';

export const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>RolloutCtrl - Projects</title>
      </Helmet>
      <ProjectsContainer />
    </div>
  );
};