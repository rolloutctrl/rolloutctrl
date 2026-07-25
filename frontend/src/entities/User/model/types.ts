import type { ProjectMember } from "@/entities/Project";
import type { OrganizationRole } from "@/shared/types/enums";
import type { Nullable } from "@/shared/types/types";

export type User = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  avatar: string;
  bio?: string;
  joinedAt: Nullable<string>;
  updatedAt: string
  organizationId: string;
  organizationRole: OrganizationRole;
  projectMembers: ProjectMember[];
};

export type RolesWithPermissions = {
  role: string;
  permissions: string[];
}
