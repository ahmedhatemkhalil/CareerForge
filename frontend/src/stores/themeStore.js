import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: "light",

  setTheme: (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));

export default useThemeStore;
