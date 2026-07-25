export type EditUserFormState = {
  name: string;
  email: string;
  bio?: string;
};

export type EditUserBody = Omit<EditUserFormState, 'email'>;