import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { tokenManager } from '@/shared/api/tokenManager';
import { getUnreadNotificationCountQueryKey } from '@/shared/constants/consts';

type UnreadCountData = { count: number };

const SSE_RECONNECT_DELAY = 3000;

let activeController: AbortController | null = null;

const subscribeUnreadCount = (
  queryClient: QueryClient,
): Promise<UnreadCountData> => {
  const token = tokenManager.getAccessToken();
  if (!token) return Promise.resolve({ count: 0 });

  activeController?.abort();
  const ctrl = new AbortController();
  activeController = ctrl;

  const queryKey = [getUnreadNotificationCountQueryKey];

  return new Promise<UnreadCountData>((resolve, reject) => {
    let resolved = false;

    fetchEventSource(
      `${import.meta.env.VITE_API_URL}/api/notifications/unread-count`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        signal: ctrl.signal,
        onmessage(event) {
          try {
            const data = JSON.parse(event.data) as UnreadCountData;
            if (!resolved) {
              resolved = true;
              resolve(data);
            } else {
              queryClient.setQueryData(queryKey, data);
            }
          } catch {
            // ignore malformed payloads
          }
        },
        onerror(err) {
          if (!resolved) {
            reject(err);
            throw err;
          }
        },
        onclose() {
          if (!resolved) return;
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey });
          }, SSE_RECONNECT_DELAY);
        },
      },
    ).catch(() => {
      // onerror threw before resolve — reject() already informed useQuery.
      // This only prevents an unhandled promise rejection warning.
    });
  });
};

export const useGetUnreadNotificationCount = (isAuthenticated: boolean) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [getUnreadNotificationCountQueryKey],
    queryFn: () => subscribeUnreadCount(queryClient),
    enabled: isAuthenticated,
  });
};
