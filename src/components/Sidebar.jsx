import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

function Sidebar({ isOpen, onClose, navigationItems }) {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`relative h-full w-[280px] border-r border-ui-border bg-surface-base shadow-float-light dark:shadow-float-dark transition-transform duration-normal ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="mb-6 flex items-center justify-between px-4 py-5">
          <h2 className="text-lg font-semibold text-content-primary">Navigation</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ui-border text-content-primary transition hover:border-ui-border-strong"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm no-underline transition ${
                  isActive
                    ? "border-accent-400/60 bg-accent-400/15 text-accent-600 dark:text-accent-200"
                    : "border-transparent text-content-tertiary hover:border-ui-border hover:bg-surface-dim hover:text-content-secondary"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
