import { Nullable } from 'src/common/types/common';

export type ApiKeyBasic = {
  id: string;
  key: string;
  name: string;
  type: string;
  projectId: string;
  allowedOrigins: string;
  environmentId: string;
  environmentName: string;
  createdAt: Date;
  revokedAt: Nullable<Date>;
};
