import { RootState } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import 'react-native-url-polyfill/auto';
import {
  AuthRequest,
  AuthSessionResult,
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
} from "expo-auth-session";

// --- Types ---
export type UserInfo = {
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
};

export type ResponseToken = {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  idToken?: string;
  issuedAt: number;
};

interface AuthState {
  token: ResponseToken;
  user: UserInfo;
  roles: string[];
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

// --- Constants ---
const CLIENT_ID = "login-app";
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

// --- Initial State ---
const initialState: AuthState = {
  user: {},
  roles: [],
  loading: false,
  error: null,
  token: {
    accessToken: "",
    expiresIn: 0,
    refreshToken: "",
    idToken: "",
    issuedAt: 0,
  },
  isLoggedIn: false,
};

// --- Redirect URI for mobile deep linking ---
export const redirectUri = makeRedirectUri({ native: "com.signusk" });
export const handleLogin = createAsyncThunk<
  void,
  {
    request: AuthRequest;
    promptAsync: () => Promise<AuthSessionResult>;
    discovery: DiscoveryDocument;
  },
  { rejectValue: string }
>(
  "authentification/handleLogin",
  async (
    { request, promptAsync, discovery },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await promptAsync();

      // Handle all possible result types
      switch (result.type) {
        case "cancel":
        case "dismiss":
          return rejectWithValue("Authentication cancelled by user");

        case "error":
          return rejectWithValue(
            (result as { error?: { message?: string } }).error?.message ||
              "Authentication error occurred"
          );

        case "success":
          if (!result.params.code) {
            return rejectWithValue(
              "Authentication failed - no authorization code"
            );
          }
          break;

        default:
          return rejectWithValue("Unknown authentication result");
      }

      // If we get here, we have a success result with a code
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier!,
          },
        },
        discovery
      );

      if (!tokenResponse.accessToken) {
        return rejectWithValue("Invalid token response");
      }

      const token: ResponseToken = {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        idToken: tokenResponse.idToken,
        expiresIn: tokenResponse.expiresIn ?? 0,
        issuedAt: Date.now(),
      };

      dispatch(loginSuccess(token));

      const userInfo = decodeJwtPayload(token.accessToken);
      if (userInfo) {
        dispatch(setUser(userInfo));
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.accessToken),
        token.refreshToken &&
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken),
      ]);
    } catch (error) {
      console.error("Authentication error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: "authentification",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<ResponseToken>) {
      state.token = action.payload;
      state.loading = false;
      state.isLoggedIn = true;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setUser(state, action: PayloadAction<UserInfo>) {
      state.user = action.payload;
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload;
    },
    logout(state) {
      Object.assign(state, initialState);
      AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    },
    resetAuthState(state) {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleLogin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

// --- Helper to Decode JWT ---
function decodeJwtPayload(token: string): UserInfo | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded) as UserInfo;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

// --- Actions ---
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setUser,
  setRoles,
  logout,
  resetAuthState,
} = authSlice.actions;

// --- Selectors ---
export const selectAuth = (state: RootState) => state.authentification;
export const selectIsLoggedIn = (state: RootState) =>
  state.authentification.isLoggedIn;
export const selectAuthToken = (state: RootState) =>
  state.authentification.token.accessToken;
export const selectUser = (state: RootState) => state.authentification.user;
export const selectAuthError = (state: RootState) =>
  state.authentification.error;
export const selectAuthLoading = (state: RootState) =>
  state.authentification.loading;

// --- Export Reducer ---
export default authSlice.reducer;
