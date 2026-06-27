import { create } from "zustand";

import { getCurrentUser } from "@/services/user/user";
import { loadUserTheme } from "@/utils/theme";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthReady: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  login: (user, token, refreshToken) => {
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    set({
      user: user ?? get().user,
      token,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
    });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      set({ user: null, token: null, isAuthReady: true });
      return;
    }

    try {
      const user = await getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthReady: true });
      await loadUserTheme().catch(() => {});
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      set({ user: null, token: null, isAuthReady: true });
    }
  },
}));

export default useAuthStore;
