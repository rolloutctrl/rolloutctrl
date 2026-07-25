import { AUTH_TOKEN_KEY } from "../constants/consts";

const createTokenManager = () => {
  const setToken = (accessToken: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  };

  const getAccessToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
  const clearTokens = () => localStorage.removeItem(AUTH_TOKEN_KEY);

  return {
    setToken,
    getAccessToken,
    clearTokens,
  };
};

export const tokenManager = createTokenManager();
