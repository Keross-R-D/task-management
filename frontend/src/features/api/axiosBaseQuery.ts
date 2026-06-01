import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";

export interface AxiosBaseQueryArgs {
  apiUrl: string;
  config?: AxiosRequestConfig;
}

export interface AxiosBaseQueryError {
  status: unknown;
  data: unknown | string;
}

/**
 * RTK Query base query adapter for the shared axiosInstance.
 *
 * Token management (attach, refresh, logout) is fully handled by the
 * library's interceptors — no reauth wrapper needed here.
 */
export function axiosBaseQuery(
  { baseUrl }: { baseUrl: string } = { baseUrl: "" },
): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> {
  return async ({ apiUrl, config }: AxiosBaseQueryArgs) => {
    try {
      let fullUrl = apiUrl;
      if (baseUrl && !apiUrl.startsWith("http")) {
        fullUrl = `${baseUrl}${apiUrl}`;
      }

      const incomingHeaders = config?.headers ? { ...config.headers } : {};
      const hasContentType = Object.keys(incomingHeaders).some(
        (k) => k.toLowerCase() === "content-type",
      );
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
