import type { AuditLogFilterStoreState } from "../model/types";

export const auditLogFilterStoreDefaultState: AuditLogFilterStoreState = {
  search: '',
  action: null,
  userId: null,
  resourceType: null,
  dateRange: [null, null],
  resourceId: '',
}