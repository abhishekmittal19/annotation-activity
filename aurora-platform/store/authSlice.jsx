import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { type } from "os";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log(payload);

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("aurora_token");
  const storedUser = localStorage.getItem("aurora_user");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("aurora_token");
    localStorage.removeItem("aurora_user");

    return null;
  }

  if (!storedUser) {
    localStorage.removeItem("aurora_token");
    return null;
  }

  try {
    const user = JSON.parse(storedUser);

    return {
      token,
      user,
    };
  } catch {
    localStorage.removeItem("aurora_token");
    localStorage.removeItem("aurora_user");

    return null;
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log(state, action);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      console.log(typeof (window))

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "aurora_user",
          JSON.stringify(action.payload.user),
        );
      }
    },
    switchRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("aurora_user", JSON.stringify(state.user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("aurora_token");
        localStorage.removeItem("aurora_user");
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("aurora_token");
        const userStr = localStorage.getItem("aurora_user");
        if (token && userStr) {
          try {
            state.user = JSON.parse(userStr);
            state.token = token;
            state.isAuthenticated = true;
          } catch {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      }
      state.isLoading = false;
    },
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
