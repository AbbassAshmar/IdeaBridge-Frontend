import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

function ThemeSwitcher() {
  const { theme, effectiveTheme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system",
      label: "System Default",
      icon: Monitor,
    },
  ];

  const currentOption = themeOptions.find((opt) => opt.value === theme);
  const CurrentIcon = currentOption?.icon || Monitor;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
      return () => window.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isOpen]);

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="inline-flex relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-lg bg-surface-sunken text-content-primary transition hover:border-ui-border-strong hover:text-accent-400"
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-7 mt-2 w-48 rounded-card border border-ui-border bg-surface-overlay shadow-float-light dark:shadow-float-dark">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={`flex w-full items-center gap-2 rounded-card px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-accent-400/20 text-accent-600 dark:text-accent-200"
                    : "text-content-primary hover:bg-surface-dim"
                }`}
                role="menuitem"
              >
                <Icon size={16} />
                <span>{option.label}</span>
                {isSelected && (
                  <span className="ml-auto inline-block h-2 w-2 rounded-pill bg-accent-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
