import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: "light",

  setTheme: (theme) => set({ theme }),
}));

export default useThemeStore;
