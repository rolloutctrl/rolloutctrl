import type { OrganizationRole } from "@/shared/types/enums";
import type { AssignMemberToProjectState } from "../../AddOrganizationMember/model/types";

export type EditOrganizationMemberFormState = {
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationId: string;
  role: OrganizationRole;
  projects: AssignMemberToProjectState[];
};
