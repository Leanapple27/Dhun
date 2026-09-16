import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  googleLogin: (credential?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("dhun_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dhun_token");
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || "Invalid email or password");
      }

      const { user, token, refreshToken } = json.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("dhun_token", token);
        localStorage.setItem("dhun_user", JSON.stringify(user));
        if (refreshToken) localStorage.setItem("dhun_refresh_token", refreshToken);
      }

      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          name: username.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.message || "Failed to create account");
      }

      const { user, token, refreshToken } = json.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("dhun_token", token);
        localStorage.setItem("dhun_user", JSON.stringify(user));
        if (refreshToken) localStorage.setItem("dhun_refresh_token", refreshToken);
      }

      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true });

    let googleId = credential || "google_" + Date.now();
    let email = "google.listener@dhun.app";
    let username = "Google Listener";
    let avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

    // If a real Google JWT ID token was passed, decode it
    if (credential && credential.includes(".")) {
      try {
        const base64Url = credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        if (payload?.sub) googleId = payload.sub;
        if (payload?.email) email = payload.email;
        if (payload?.name) username = payload.name;
        else if (payload?.given_name) username = payload.given_name;
        if (payload?.picture) avatar = payload.picture;
      } catch (e) {
        console.warn("Could not parse Google ID token payload:", e);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId,
          email,
          username,
          avatar,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const { user, token } = json.data;
        if (typeof window !== "undefined") {
          localStorage.setItem("dhun_token", token);
          localStorage.setItem("dhun_user", JSON.stringify(user));
        }
        set({ user, token, isLoading: false });
        return;
      }
    } catch {
      // Fallback to local session
    }

    const fallbackUser: User = {
      id: googleId,
      email,
      username,
      avatar,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("dhun_token", "token_google_valid");
      localStorage.setItem("dhun_user", JSON.stringify(fallbackUser));
    }
    set({ user: fallbackUser, token: "token_google_valid", isLoading: false });
  },

  demoLogin: async () => {
    set({ isLoading: true });
    try {
      // Try login as demo user, or register if not exist
      try {
        await get().login("demo@dhun.app", "demo1234");
        return;
      } catch {
        await get().register("demo@dhun.app", "Dhun Explorer", "demo1234");
        return;
      }
    } catch {
      const demoUser: User = {
        id: "usr_demo",
        email: "demo@dhun.app",
        username: "Dhun Explorer",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("dhun_token", "demo_jwt_token");
        localStorage.setItem("dhun_user", JSON.stringify(demoUser));
      }
      set({ user: demoUser, token: "demo_jwt_token", isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("dhun_token");
      localStorage.removeItem("dhun_user");
      localStorage.removeItem("dhun_refresh_token");
    }
    set({ user: null, token: null, isLoading: false });
  },

  refreshToken: async () => {},

  loadUser: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("dhun_token");
    const storedUser = localStorage.getItem("dhun_user");

    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    if (storedUser) {
      try {
        set({ user: JSON.parse(storedUser), token });
      } catch {
        // Continue to fetch
      }
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        set({ user: json.data, token, isLoading: false });
        localStorage.setItem("dhun_user", JSON.stringify(json.data));
      }
    } catch {
      // Keep stored user if offline
      set({ isLoading: false });
    }
  },
}));
