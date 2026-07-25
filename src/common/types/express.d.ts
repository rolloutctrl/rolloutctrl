import { ApiKey } from '../generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      sdkApiKey: Omit<
        ApiKey,
        'keyHash' | 'createdAt' | 'updatedAt' | 'revokedAt'
      >;
    }
  }
}

export {};
