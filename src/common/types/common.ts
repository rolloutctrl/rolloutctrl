// import { Request } from 'express';
import { Session, User } from '../generated/prisma/client';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type JwtSessionPayload = {
  sub: string;
  sessionId: string;
  exp?: number;
  iat?: number;
};

export type JwtUserPayload = {
  sub: string;
  sessionId: string;
  exp?: number;
  iat?: number;
  user: Omit<User, 'password'>;
};

export type JwtRefreshGuardData = {
  userId: string;
  sessionId: string;
  session: Session;
  refreshToken: string;
  tokenExpired: boolean;
};

export type OperatorConfig = {
  supportsNot: boolean;
  validate?: (value: unknown) => boolean;
  errorMessage?: string;
};

export type RuleValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | {
      from: string;
      to: string;
    };
