import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type AuditLogFilterStoreAction,
  type AuditLogFilterStoreState,
} from './types';
import { auditLogFilterStoreDefaultState } from '../lib/consts';

const initialState: AuditLogFilterStoreState = {
  ...auditLogFilterStoreDefaultState,
};

export const useAuditLogsFilterStore = create<
  AuditLogFilterStoreState & AuditLogFilterStoreAction
>()(
  persist(
    (set) => ({
      ...initialState,
      handleSelect: (name, value) =>
        set((state) => ({
          ...state,
          [name]: value,
        })),
      handleInput: (name, value) =>
        set((state) => ({
          ...state,
          [name]: value,
        })),
      setDateRange: (values) =>
        set({
          dateRange: [
            ...values.map((value) =>
              value ? new Date(value).getTime() : value,
            ),
          ],
        }),
      clearFilters: () =>
        set({
          ...initialState,
        }),
    }),
    { name: 'auditLogsFilter' },
  ),
);

export const auditLogsfilters = (): Partial<AuditLogFilterStoreState> => ({
  userId: useAuditLogsFilterStore.getState().userId,
  search: useAuditLogsFilterStore.getState().search,
  resourceType: useAuditLogsFilterStore.getState().resourceType,
  action: useAuditLogsFilterStore.getState().action,
  dateRange: useAuditLogsFilterStore.getState().dateRange,
});
export const clearAuditLogsFilters = () =>
  useAuditLogsFilterStore.getState().clearFilters();
