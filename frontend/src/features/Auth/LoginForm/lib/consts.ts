import * as yup from 'yup';

import type { LoginFormState } from "../model/types";

export const loginFormDefaultState: LoginFormState = {
  email: '',
  password: '',
} as const;

export const loginFormSchema = yup.object().shape({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
});
