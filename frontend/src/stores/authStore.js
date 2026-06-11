// src/store/authStore.js

import { create } from "zustand";

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("token"),

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
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
      user,
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
}));

export default useAuthStore;
