// src/components/Navbar.jsx

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  Map,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  // Auth Pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Get User
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    const isDark = document.documentElement.classList.contains("dark");

    setDarkMode(isDark);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  // Toggle Theme
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");

    setDarkMode(!darkMode);
  };

  // Navbar Links
  const navLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "CV Analyzer",
      path: "/analyzer",
      icon: <FileText size={18} />,
    },
    {
      name: "Interview",
      path: "/interview",
      icon: <MessageSquare size={18} />,
    },
    {
      name: "Roadmap",
      path: "/roadmap",
      icon: <Map size={18} />,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        {!isAuthPage && (
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              ✦
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-foreground">
                Smart CV
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                AI Career Assistant
              </span>
            </div>
          </Link>
        )}
        {/* ========================= */}
        {/* Normal Navbar */}
        {/* ========================= */}

        {!isAuthPage && (
          <>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3 bg-card border border-border p-2 rounded-2xl">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 transform
                      ${
                        active
                          ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl scale-100"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground hover:scale-105"
                      }
                      `}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Theme */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-accent transition flex items-center justify-center"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User */}
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-card border border-border">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white flex items-center justify-center font-bold uppercase text-sm shadow">
                      {user.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium shadow hover:opacity-95 transition"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="md:hidden w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center"
              >
                {openMenu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================= */}
      {/* Mobile Menu */}
      {/* ========================= */}

      {!isAuthPage && openMenu && (
        <div className="md:hidden border-t border-border bg-card px-4 py-5 flex flex-col gap-3">
          {/* Links */}
          {navLinks.map((link) => {
            const active = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setOpenMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                  
                  ${
                    active
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-primary-foreground"
                      : "hover:bg-accent"
                  }
                `}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}

          {/* Mobile User */}
          {user ? (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-primary-foreground flex items-center justify-center font-bold uppercase">
                  {user.name?.charAt(0)}
                </div>

                <p className="font-medium">{user.name}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-primary-foreground text-center font-medium"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
