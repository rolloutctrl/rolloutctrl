import type { EditUserFormState } from "../model/types";

export const editUserFormDefaultState: EditUserFormState = {
  name: '',
  email: '',
  bio: '',
} as const;