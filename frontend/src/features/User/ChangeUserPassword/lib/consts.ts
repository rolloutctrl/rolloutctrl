import type { ChangeUserPasswordFormState } from '../model/types';

export const changeUserPasswordFormDefaultState: ChangeUserPasswordFormState = {
  password: '',
  confirmPassword: '',
} as const;
