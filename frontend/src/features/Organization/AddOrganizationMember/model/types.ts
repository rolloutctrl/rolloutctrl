import type { OrganizationRole } from "@/shared/types/enums";

export type AssignMemberToProjectState = {
  projectId: string;
  teamRole: string;
}

export type AddOrganizationMemberFormState = {
  name: string;
  organizationId: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: OrganizationRole;
  projects: AssignMemberToProjectState[];
};
