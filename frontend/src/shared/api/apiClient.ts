import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { tokenManager } from "./tokenManager";
import { useCurrentProjectStore } from "@/features/Project/SelectCurrentProject";

export type ErrorWithStatusCode = {
  statusCode: number;
  message: string;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const authChannel = new BroadcastChannel("auth");

authChannel.onmessage = (event) => {
  if (event.data.type === "TOKEN_UPDATED") {
    tokenManager.setToken(event.data.accessToken);
  }

  if (event.data.type === "LOGOUT") {
    tokenManager.clearTokens();
    window.location.href = "/";
  }
};

let refreshPromise: Promise<string> | null = null;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const projectId = useCurrentProjectStore.getState().selectedProjectId;
  if (projectId && config.headers) {
    config.headers['X-Project-Id'] = projectId;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (refreshPromise) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    refreshPromise = (async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newToken = response.data.accessToken;

        tokenManager.setToken(newToken);

        authChannel.postMessage({
          type: "TOKEN_UPDATED",
          accessToken: newToken,
        });

        processQueue(null, newToken);

        return newToken;
      } catch (err) {
        processQueue(err, null);

        tokenManager.clearTokens();

        authChannel.postMessage({
          type: "LOGOUT",
        });

        window.location.href = "/";

        throw err;
      } finally {
        refreshPromise = null;
      }
    })();

    const newToken = await refreshPromise;

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    }

    return apiClient(originalRequest);
  }
);
