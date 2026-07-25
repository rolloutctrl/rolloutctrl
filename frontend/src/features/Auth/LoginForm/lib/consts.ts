import type { LoginFormState } from "../model/types";

export const loginFormDefaultState: LoginFormState = {
  email: '',
  password: '',
} as const;
