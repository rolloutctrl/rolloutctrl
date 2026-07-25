import { IconChevronRight, IconHome } from '@tabler/icons-react';
import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

interface RouteConfig {
  path?: string;
  element?: React.ReactNode;
  children?: RouteConfig[];
  handle?: { breadcrumb?: string | ((params: Record<string, string>) => string) };
}

const collectRoutes = (routes: RouteConfig[], parentPath = ''): RouteConfig[] => {
  const collected: RouteConfig[] = [];

  routes.forEach((route: RouteConfig) => {
    const currentPath = parentPath + (route.path || '');
    
    if (route.path && route.path !== '*') {
      collected.push({
        path: currentPath,
        handle: route.handle,
        element: route.element,
        children: route.children || []
      });
    }

    if (route.children && route.children.length > 0) {
      collected.push(...collectRoutes(route.children, currentPath));
    }
  });

  return collected;
};

const findMatchingRoute = (routes: RouteConfig[], pathname: string) => {
  for (const route of routes) {
    const path = route.path || '';
    const paramRegex = path.replace(/:[^\s/]+/g, '([^/]+)');
    const regex = new RegExp(`^${paramRegex}$`);
    
    const match = pathname.match(regex);
    if (match) {
      const paramNames = (path.match(/:[^\s/]+/g) || []).map((p: string) => p.slice(1));
      const params: Record<string, string> = {};
      paramNames.forEach((name: string, idx: number) => {
        params[name] = match[idx + 1] || '';
      });
      
      return { route, params };
    }
  }
  return null;
};

type BreadcrumbsProps = {
  routesConfig: RouteConfig[];
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
  homeText?: string;
  className?: string;
  breadcrumbClassName?: string;
  activeClassName?: string;
  separatorClassName?: string;
  containerClassName?: string;
};

export const Breadcrumbs = ({ 
  routesConfig, 
  separator = <IconChevronRight size={14} />,
  showHomeIcon = true,
  homeText = "Home",
  className = "",
  breadcrumbClassName = "",
  activeClassName = "",
  separatorClassName = "",
  containerClassName = ""
}: BreadcrumbsProps) => {
  const location = useLocation();
  const currentParams = useParams();

  const allRoutes = useMemo(() => {
    return collectRoutes(routesConfig);
  }, [routesConfig]);

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    const crumbs = [];
    let accumulatedPath = '';

    for (let i = 0; i < pathnames.length; i++) {
      accumulatedPath += `/${pathnames[i]}`;
      
      const match = findMatchingRoute(allRoutes, accumulatedPath);
      
      let name = pathnames[i];
      let params = {};
      
      if (match) {
        params = match.params;
        const breadcrumbConfig = match.route.handle?.breadcrumb;
        
        if (breadcrumbConfig) {
          if (typeof breadcrumbConfig === 'function') {
            name = breadcrumbConfig({ ...params, ...currentParams });
          } else {
            name = breadcrumbConfig;
          }
        }
      }
      
      const isLast = i === pathnames.length - 1;
      
      crumbs.push({
        path: accumulatedPath,
        name,
        isLast,
        params
      });
    }
    
    return crumbs;
  }, [location.pathname, allRoutes, currentParams]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 ${containerClassName}`}
      aria-label="Breadcrumb"
    >
      <ol className={`flex items-center flex-wrap gap-y-1 ${className}`}>
        {showHomeIcon && (
          <li className="flex items-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center"
            >
              <IconHome size={14}/>
              {homeText && <span className="ml-1 text-sm">{homeText}</span>}
            </Link>
            {breadcrumbs.length > 0 && (
              <span className={`mx-2 text-gray-300 select-none ${separatorClassName}`}>
                {separator}
              </span>
            )}
          </li>
        )}
        
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {crumb.isLast ? (
              <span className={`text-sm font-semibold text-gray-900 cursor-default ${activeClassName}`}>
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={`text-sm text-gray-600 hover:text-blue-600 hover:underline transition-all duration-200 ${breadcrumbClassName}`}
              >
                {crumb.name}
              </Link>
            )}
            
            {!crumb.isLast && index < breadcrumbs.length - 1 && (
              <span className={`mx-2 text-gray-300 select-none ${separatorClassName}`}>
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text } from '@mantine/core';
// import { Link, useLocation, useMatches } from 'react-router-dom';
// import { IconChevronRight } from '@tabler/icons-react';

// export type BreadcrumbItem = {
//   label: string;
//   path?: string;
// };

// type BreadCrumbsProps = {
//   items?: BreadcrumbItem[];
// };

// export const Breadcrumbs = ({ items }: BreadCrumbsProps) => {
//   const location = useLocation();
//   const matches = useMatches();

//   // If items provided via props, use them
//   if (items && items.length > 0) {
//     return (
//       <MantineBreadcrumbs separator={<IconChevronRight size={16} />}>
//         {items.map((item, index) => {
//           const isLast = index === items.length - 1;

//           if (isLast || !item.path) {
//             return (
//               <Text key={index} size="sm" c="dimmed">
//                 {item.label}
//               </Text>
//             );
//           }

//           return (
//             <Anchor
//               key={index}
//               component={Link}
//               to={item.path}
//               size="sm"
//             >
//               {item.label}
//             </Anchor>
//           );
//         })}
//       </MantineBreadcrumbs>
//     );
//   }

//   // Auto-generate from route matches with handle.breadcrumb
//   const breadcrumbMatches = matches.filter(
//     (match) => match.handle && (match.handle as { breadcrumb?: string }).breadcrumb
//   );

//   if (breadcrumbMatches.length === 0) {
//     return null;
//   }

//   const pathSegments = location.pathname.split('/').filter(Boolean);

//   return (
//     <MantineBreadcrumbs separator={<IconChevronRight size={16} />}>
//       <Anchor component={Link} to="/" size="sm">
//         Home
//       </Anchor>

//       {breadcrumbMatches.map((match, index) => {
//         const handle = match.handle as { breadcrumb: string; crumb?: (params: Record<string, string>) => string };
//         const isLast = index === breadcrumbMatches.length - 1;

//         // Build path up to this match
//         const path = '/' + pathSegments.slice(0, index + 1).join('/');

//         // If custom crumb function provided, use it
//         const label = handle.crumb
//           ? handle.crumb(match.params as Record<string, string>)
//           : handle.breadcrumb;

//         if (isLast) {
//           return (
//             <Text key={index} size="sm" c="dimmed">
//               {label}
//             </Text>
//           );
//         }

//         return (
//           <Anchor key={index} component={Link} to={path} size="sm">
//             {label}
//           </Anchor>
//         );
//       })}
//     </MantineBreadcrumbs>
//   );
// };