import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getAvatarData } from "../utils/avatar";
import ThemeSwitcher from "./ThemeSwitcher";

function Navbar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const profileName = useMemo(
    () => user?.username || user?.email || "User",
    [user],
  );
  const avatar = useMemo(() => getAvatarData(profileName), [profileName]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ui-border bg-surface-raised/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ui-border bg-surface-sunken text-content-primary transition hover:border-ui-border-strong hover:text-accent-400"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
          ) : null}

          <Link
            to={isAuthenticated ? "/ideas" : "/login"}
            className="flex items-center gap-3 no-underline"
            aria-label="IdeaForge home"
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-card bg-gradient-to-br from-accent-400 to-accent-500 text-sm font-display text-content-inverse shadow-glow-accent"
              aria-hidden="true"
            >
              <Sparkles size={16} />
            </span>
            <span className="text-xl font-semibold text-content-primary">IdeaForge</span>
          </Link>
        </div>

        {!isAuthenticated ? (
          <nav className="flex items-center gap-3 md:gap-4" aria-label="Primary">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "text-content-primary"
                    : "text-content-tertiary hover:text-content-secondary"
                }`
              }
            >
              <LogIn size={15} />
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 rounded-card border border-accent-400 bg-gradient-to-br from-accent-400 to-accent-500 px-4 py-2 text-sm font-semibold text-content-inverse no-underline transition hover:-translate-y-0.5 hover:shadow-glow-accent ${
                  isActive ? "shadow-glow-accent" : ""
                }`
              }
            >
              <UserPlus size={15} />
              Register
            </NavLink>
          </nav>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-pill bg-surface-sunken px-2 py-1.5 text-content-primary transition hover:border-ui-border-strong"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-pill text-sm font-display text-content-primary"
                  style={avatar.style}
                  aria-hidden="true"
                >
                  {avatar.initial}
                </span>
                <span className="hidden max-w-[180px] truncate text-sm font-medium text-content-primary md:block">
                  {profileName}
                </span>
                <ChevronDown size={16} className="text-content-tertiary" />
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 mt-2 w-48 rounded-card border border-ui-border bg-surface-overlay shadow-float-light dark:shadow-float-dark">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-card px-3 py-2 text-sm text-content-primary no-underline transition hover:bg-surface-dim"
                    role="menuitem"
                  >
                    <User size={15} />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-card px-3 py-2 text-left text-sm text-content-primary transition hover:bg-surface-dim"
                    role="menuitem"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
