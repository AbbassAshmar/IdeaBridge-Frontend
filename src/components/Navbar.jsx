import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="mx-auto mt-4 flex h-auto w-[92vw] max-w-6xl items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-900/70 px-4 py-3 backdrop-blur md:h-[68px] md:px-5 md:py-0">
      <Link
        to={isAuthenticated ? "/dashboard" : "/login"}
        className="flex items-center gap-3 no-underline"
        aria-label="IdeaForge home"
      >
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-slate-50 shadow-glow"
          aria-hidden="true"
        >
          <Sparkles size={16} />
        </span>
        <span className="text-base font-semibold text-slate-100">
          IdeaForge
        </span>
      </Link>

      <nav className="flex items-center gap-3 md:gap-4" aria-label="Primary">
        {!isAuthenticated ? (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "text-slate-50"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              <LogIn size={15} />
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 rounded-lg border border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-50 no-underline transition hover:-translate-y-0.5 hover:shadow-glow ${
                  isActive ? "shadow-glow" : ""
                }`
              }
            >
              <UserPlus size={15} />
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "text-slate-50"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              <LayoutDashboard size={15} />
              Dashboard
            </NavLink>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-50 transition hover:-translate-y-0.5 hover:shadow-glow"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
