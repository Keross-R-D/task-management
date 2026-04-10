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

const token = localStorage.getItem("token")
  ? JSON.parse(localStorage.getItem("token") as string)
  : null;

const initialState: AuthState = {
  user: null,
  token: token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<TokenResponse | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("token");
      }
      state.isAuthenticated = !!action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      state.isAuthenticated = false;
      // Maintain cookie cleanup for ikon library
      document.cookie = "ikoncloud_next_accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "ikoncloud_next_refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = '/login';
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const isAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
