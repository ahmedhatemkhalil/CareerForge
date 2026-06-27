import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import useThemeStore from "@/stores/themeStore";
export default function Navbar() {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const darkMode = theme === "dark";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(darkMode ? "light" : "dark");
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 border-b border-border
      ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-md"
          : "bg-background/70 backdrop-blur-lg "
      }
      `}
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="h-20 flex items-center justify-between">

          <Link to="/hero" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white">
              <Sparkles size={22} />
            </div>

            <span className="font-bold text-xl">
              CareerForge
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <Button variant="outline" onClick={toggleTheme} className="h-11 w-11 rounded-full p-0">
              {darkMode ? (<Sun size={18} className="text-yellow-500 cursor-pointer"/>) : (<Moon size={18}className="text-muted-foreground cursor-pointer"/>)}
            </Button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="lg" onClick={() => navigate("/login")} className="cursor-pointer sm:flex h-11 hover:bg-accent border-primary dark:border-accent-foreground">
                Sign In
              </Button>

              <Button size="lg" onClick={() => navigate("/register")} className="cursor-pointer h-11 hover:opacity-90 transition">
                Create Free Account
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="outline" size="lg" className="cursor-pointer h-11 w-11 md:hidden border-primary dark:border-accent-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={22} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="flex flex-col gap-3 p-4">
            <Button className="p-5" variant="outline"
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
            >
              Sign In
            </Button>

            <Button className="p-5" onClick={() => {
                navigate("/register");
                setMobileMenuOpen(false);
              }}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}