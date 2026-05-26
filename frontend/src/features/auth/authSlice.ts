import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface User {
  userId: string;
  userName: string;
  userEmail?: string;
}

export interface AuthState {
  user: User | null;
  token: TokenResponse | null;
  isAuthenticated: boolean;
}

// Cookie helpers
const setCookie = (name: string, value: string, expiresInSeconds: number) => {
  const date = new Date();
  date.setTime(date.getTime() + expiresInSeconds * 1000);

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${date.toUTCString()}; path=/`;
};

const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Load token from cookie
const accessToken = getCookie("ikoncloud_next_accessToken");
const refreshToken = getCookie("ikoncloud_next_refreshToken");

const token: TokenResponse | null =
  accessToken && refreshToken
    ? {
        accessToken,
        refreshToken,
        expiresIn: 0,
        refreshExpiresIn: 0,
      }
    : null;

const initialState: AuthState = {
  user: null,
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<TokenResponse | null>) => {
      state.token = action.payload;

      if (action.payload) {
        setCookie(
          "ikoncloud_next_accessToken",
          action.payload.accessToken,
          action.payload.expiresIn,
        );

        setCookie(
          "ikoncloud_next_refreshToken",
          action.payload.refreshToken,
          action.payload.refreshExpiresIn,
        );
      } else {
        deleteCookie("ikoncloud_next_accessToken");
        deleteCookie("ikoncloud_next_refreshToken");
      }

      state.isAuthenticated = !!action.payload;
    },

    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      deleteCookie("ikoncloud_next_accessToken");
      deleteCookie("ikoncloud_next_refreshToken");

      state.isAuthenticated = false;

      window.location.href = "/login";
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const isAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
