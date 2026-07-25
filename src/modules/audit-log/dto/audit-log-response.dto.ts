import { AuditAction, ResourceType } from 'src/common/generated/prisma/client';

export class AuditLogResponseDto {
  id: string;
  projectId: string | null;
  userId: string | null;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  resourceName?: string;
  metadata: any;
  createdAt: Date;
}
