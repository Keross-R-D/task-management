import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";
import { logout } from "../auth/authSlice";
import type { AuthState } from "../auth/authSlice";

export interface AxiosBaseQueryArgs {
  apiUrl: string;
  config?: AxiosRequestConfig;
}

export interface AxiosBaseQueryError {
  status: unknown;
  data: unknown | string;
}

export function axiosBaseQuery({ baseUrl }: { baseUrl: string } = { baseUrl: "" }): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> {
  return async ({ apiUrl, config }: AxiosBaseQueryArgs) => {
    try {
      let fullUrl = apiUrl;
      if (baseUrl && !apiUrl.startsWith("http")) {
         fullUrl = `${baseUrl}${apiUrl}`;
      }
      
      const incomingHeaders = config?.headers ? { ...config.headers } : {};
      const hasContentType = Object.keys(incomingHeaders).some((k) => k.toLowerCase() === "content-type");
      const headers = { ...incomingHeaders };
      if (!hasContentType) {
        headers["Content-Type"] = "application/json";
      }

      const configWithDefaults = { ...config, headers };
      const result = await axiosInstance(fullUrl, configWithDefaults);
      return { data: result.data };
    } catch (axiosError) {
      const error = axiosError as AxiosError<any>;
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data?.error || error.message,
        },
      };
    }
  };
}

let refreshTokenPromise: Promise<string | null> | null = null;

export function axiosBaseQueryWithReauth({ baseUrl }: { baseUrl: string } = { baseUrl: "" }): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> {
  return async (args, api, extraOptions) => {
    const axiosBaseQueryFn = axiosBaseQuery({ baseUrl });
    const state = api.getState() as { auth: AuthState };
    const token = state?.auth?.token?.accessToken;

    const configWithAuth = {
      ...args.config,
      headers: {
        ...args.config?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const argsWithAuth = { ...args, config: configWithAuth };

    let result = await axiosBaseQueryFn(argsWithAuth, api, extraOptions);

    if (result.error?.status === 401) {
      if (args.apiUrl.includes("refresh-token")) {
        api.dispatch(logout());
        return result;
      }

      const refreshToken = state?.auth?.token?.refreshToken;

      if (!refreshToken) {
        api.dispatch(logout());
        return result;
      }

      refreshTokenPromise ??= (async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_IKON_API_URL || "https://ikoncloud-dev.keross.com/ikon-api"}/platform/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (!response.ok) throw new Error("Refresh failed");
          
          const refreshResult = await response.json();
          const newAccessToken = refreshResult?.accessToken;

          if (!newAccessToken) {
            console.warn("No access token in refresh response:", refreshResult);
            return null;
          }

          api.dispatch({ type: 'auth/setToken', payload: refreshResult });
          return newAccessToken;
        } catch (error) {
          console.error("Token refresh failed:", error);
          api.dispatch(logout());
          return null;
        } finally {
          refreshTokenPromise = null;
        }
      })();

      const newAccessToken = await refreshTokenPromise;

      if (!newAccessToken) {
        return result;
      }

      const retryConfig = {
        ...args.config,
        headers: {
          ...args.config?.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };

      result = await axiosBaseQueryFn(
        { ...args, config: retryConfig },
        api,
        extraOptions,
      );
    }

    return result;
  };
}
