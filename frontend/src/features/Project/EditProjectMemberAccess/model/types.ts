import type { TeamRole } from "@/shared/types/enums";

export type EditProjectMemberAccessFormState = {
  projectMemberId: string;
  role: TeamRole;
};
