import { type FC } from "react";
import { Navigate } from "react-router-dom";
import { navigationRoutes } from "@/shared/routes/navigationRoutes";

export const WildcardNavigate: FC = () => {
  return <Navigate to={navigationRoutes.home} replace />;
};
