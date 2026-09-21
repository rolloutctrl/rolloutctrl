import { CreateProjectButton } from '@/features/Project/CreateProject';
import { SelectCurrentProject } from '@/features/Project/SelectCurrentProject';
import { SearchInProjectSpotlight } from '@/features/Project/SearchInProjectSpotlight';
import {
  IconApi,
  IconLayoutDashboard,
  IconBolt,
  IconStack2,
  IconCloud,
  IconToggleRightFilled,
  IconSettings,
  IconTimeline,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { LinksGroup } from './LinksGroup';
import { useParams } from 'react-router-dom';
import { PermissionCode } from '@/shared/types/enums';
import { RequiredProjectPermissionsWrapper } from '@/features/Auth/PrivateRoute';
import { useGetProjectById } from '@/entities/Project';
import { useToggleNavBar } from '@/features/Theme/ToggleNavBar';

export const ProjectNavBar = () => {
  const { projectId } = useParams();
  const { data: currentProject } = useGetProjectById(projectId);
  const { collapsed, setOpened } = useToggleNavBar();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isCollapsed = isMobile ? false : collapsed;
  const handleLinkClick = () => {
    if (isMobile) setOpened(false);
  };
  const mockMenuLinks = [
    {
      label: 'Overview',
      icon: IconLayoutDashboard,
      link: `/project/${projectId}`,
      exact: true,
    },
    {
      label: 'Feature Flags',
      icon: IconToggleRightFilled,
      link: `/project/${projectId}/feature-flags`,
      needPermission: PermissionCode.FLAG_READ,
      badge: currentProject?.activeFlagsCount,
    },
    {
      label: 'Actions',
      icon: IconBolt,
      link: `/project/${projectId}/actions`,
      needPermission: PermissionCode.ACTION_READ,
      badge: currentProject?.activeActionsCount,
    },
    {
      label: 'Segments',
      icon: IconStack2,
      link: `/project/${projectId}/segments`,
      needPermission: PermissionCode.SEGMENT_READ,
    },
    {
      label: 'Environments',
      icon: IconCloud,
      link: `/project/${projectId}/env`,
      needPermission: PermissionCode.ENV_READ,
      badge: currentProject?.environmentsCount,
    },
    {
      label: 'Project Settings',
      icon: IconSettings,
      link: `/project/${projectId}/settings`,
      needPermission: PermissionCode.PROJECT_UPDATE,
    },
    {
      label: 'API Keys',
      icon: IconApi,
      link: `/project/${projectId}/api-keys`,
      needPermission: PermissionCode.API_KEY_READ,
    },
    {
      label: 'Audit Logs',
      icon: IconTimeline,
      link: `/project/${projectId}/audit-logs`,
      needPermission: PermissionCode.PROJECT_LOGS_REED,
    },
  ];
  const links = mockMenuLinks.map((item) => (
    <LinksGroup {...item} key={item.label} collapsed={isCollapsed} onLinkClick={handleLinkClick} />
  ));
  return (
    <nav className="flex flex-col w-full h-full text-left">
      {!isCollapsed && (
        <SelectCurrentProject
          createProjectButtonSlot={
            <RequiredProjectPermissionsWrapper
              permissions={PermissionCode.PROJECT_CREATE}
            >
              <CreateProjectButton isIconButton />
            </RequiredProjectPermissionsWrapper>
          }
        />
      )}
      {isMobile && (
        <div className="px-0 pb-2 pt-4">
          <SearchInProjectSpotlight w="100%" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto overflow-x-hidden mx-[-1rem]">
        <div className={`py-4 gap-0.5 flex flex-col ${isCollapsed ? 'px-2 items-center' : 'px-4'}`}>
          {links}
        </div>
      </div>
    </nav>
  );
};
