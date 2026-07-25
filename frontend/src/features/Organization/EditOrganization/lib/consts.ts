import type { EditOrganizationFormState } from "../model/types";

export const editOrganizationFormDefaultState: EditOrganizationFormState = {
  organizationId: '',
  name: '',
  url: '',
  description: '',
} as const;
