import type { AuditAction, ResourceType } from "@/shared/types/enums";
import type { Nullable } from "@/shared/types/types";

export type AuditLogFilterStoreState = {
  search: string;
  userId: Nullable<string>;
  action: Nullable<AuditAction>;
  resourceType: Nullable<ResourceType>;
  resourceId: string;
  dateRange: (number | null | Date)[];
}

export type AuditLogFilterStoreAction = {
  handleInput: (name: string, value: string) => void;
  handleSelect: (name: string, value: Nullable<string[] | string>) => void;
  setDateRange: (values: [Date | null, Date | null]) => void;
  clearFilters: () => void;
}
