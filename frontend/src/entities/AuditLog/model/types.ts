import type { Project } from '@/entities/Project';
import type { User } from '@/entities/User';
import type { ResourceType, AuditAction } from '@/shared/types/enums';
import type { Nullable } from '@/shared/types/types';

export type AuditLogMetadata = {
  reason?: string;
  strategy?: { id: string; name?: string };
  environment?: { id: string; name?: string };
  changes?: Array<{ field: string; before: unknown; after: unknown }>;
  variant?: { id: string; name: string };
  action?: { id: string; name: string };
  segment?: { id: string; name: string };
  source?: { type: string; name?: string };
  [key: string]: unknown;
};

export type AuditLog = {
  id: string;
  projectId?: string;
  userId?: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  resourceName?: Nullable<string>;
  metadata: AuditLogMetadata | null;

  createdAt: Date;

  project?: Nullable<Project>;
  user?: Nullable<User>;
};
