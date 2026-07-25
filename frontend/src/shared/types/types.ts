export type Nullable<T> = T | null;

export type OptionSelect = {
  value: string;
  label: string;
};

export type OperatorConfig = {
  supportsNot: boolean;
  label: string;
  notLabel: string;
  validate?: (value: unknown) => boolean;
  errorMessage?: string;
};

export type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};