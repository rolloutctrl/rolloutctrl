import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentProjectStore } from '../model/useCurrentProjectStore';
import { useGetProjectById, useGetProjects } from '@/entities/Project';
import { useEffect } from 'react';

export const useSelectCurrentProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { selectedProjectId, setSelectedProjectId, clearState } =
    useCurrentProjectStore();

  const { data: project } = useGetProjectById(projectId);

  const { data: projects } = useGetProjects();

  useEffect(() => {
    if (project) {
      setSelectedProjectId(project.slug);
    }
  }, [project, setSelectedProjectId]);

  const handleSelectProject = (value: string) => {
    setSelectedProjectId(value);
    navigate(`/project/${value}`);
  };

  const projectOptions = (projects || []).map((project) => ({
    label: project.name,
    value: project.slug,
  }));

  return {
    selectedProjectId,
    setSelectedProjectId,
    projectOptions,
    clearState,
    handleSelectProject,
  };
};
