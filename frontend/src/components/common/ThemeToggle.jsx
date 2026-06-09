// import { useEffect, useState } from "react";
// import useThemeStore from "../../stores/themeStore";
// import useAuthStore from "../../stores/authStore";
// import {
//   updateTheme as apiUpdateTheme,
//   getCustomColors,
//   updateCustomColors,
// } from "../../services/authService";
// import toast from "react-hot-toast";

// const colorVars = [
//   "--brand-primary",
//   "--brand-primary-hover",
//   "--brand-secondary",
//   "--brand-tertiary",
//   "--brand-blue",
// ];

// const ThemeToggle = () => {
//   const theme = useThemeStore((s) => s.theme);
//   const setTheme = useThemeStore((s) => s.setTheme);
//   const token = useAuthStore((s) => s.token);

//   const [isDark, setIsDark] = useState(
//     document.documentElement.classList.contains("dark"),
//   );

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", isDark);
//     setTheme(isDark ? "dark" : "light");
//   }, [isDark, setTheme]);

//   const handleToggle = async () => {
//     const newDark = !isDark;
//     setIsDark(newDark);

//     if (token) {
//       try {
//         await apiUpdateTheme(newDark ? "dark" : "light");
//         toast.success("Theme updated");
//       } catch (err) {
//         toast.error("Could not update theme on server");
//       }
//     } else {
//       localStorage.setItem("theme", newDark ? "dark" : "light");
//     }
//   };

//   // color handling
//   const getColor = (varName) =>
//     getComputedStyle(document.documentElement)
//       .getPropertyValue(varName)
//       .trim() || "#000000";

//   const [colors, setColors] = useState(
//     () =>
//       JSON.parse(localStorage.getItem("customColors")) ||
//       colorVars.reduce((acc, v) => ({ ...acc, [v]: getColor(v) }), {}),
//   );

//   // Load colors from backend on mount or when logged in
//   useEffect(() => {
//     const loadColorsFromBackend = async () => {
//       if (token) {
//         try {
//           const response = await getCustomColors();
//           if (
//             response.customColors &&
//             Object.keys(response.customColors).length > 0
//           ) {
//             setColors(response.customColors);
//           }
//         } catch (err) {
//           console.error("Failed to load colors from backend", err);
//         }
//       }
//     };
//     loadColorsFromBackend();
//   }, [token]);

//   useEffect(() => {
//     // apply saved colors
//     Object.entries(colors).forEach(([k, v]) => {
//       document.documentElement.style.setProperty(k, v);
//     });
//     localStorage.setItem("customColors", JSON.stringify(colors));
//   }, [colors]);

//   const handleColorChange = (varName, value) => {
//     const updatedColors = { ...colors, [varName]: value };
//     setColors(updatedColors);

//     // Sync to backend if logged in
//     if (token) {
//       updateCustomColors(updatedColors).catch((err) => {
//         console.error("Failed to save color to backend", err);
//       });
//     }
//   };

//   return (
//     <div className="flex items-center gap-3">
//       <button
//         onClick={handleToggle}
//         className="px-3 py-1 rounded bg-input-background border border-border"
//       >
//         {isDark ? "Dark" : "Light"}
//       </button>

//       <div className="flex items-center gap-2">
//         {colorVars.map((v) => (
//           <label key={v} className="flex items-center gap-2">
//             <input
//               type="color"
//               value={colors[v] || getColor(v)}
//               onChange={(e) => handleColorChange(v, e.target.value)}
//               title={v}
//               className="w-8 h-8 p-0 border border-border rounded"
//             />
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ThemeToggle;
