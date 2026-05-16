/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          50:  "#fffde7",
          100: "#fff9c4",
          200: "#fff59d",  // light tint — hover on dark surfaces
          300: "#fee95a",  // soft accent
          400: "#FEE440",  // ← PRIMARY ACCENT (banana cream)
          500: "#f5c800",  // pressed / active state
          600: "#c9a200",  // deep accent for text on light bg
          700: "#9a7a00",  // very dark for contrast-safe text
        },

        success: {
          DEFAULT: "#181d1a",
          bg:      "#dcfce7",
          dark:    "#16a34a",
        },
        warning: {
          DEFAULT: "#f59e0b",
          bg:      "#fef3c7",
          dark:    "#d97706",
        },
        danger: {
          DEFAULT: "#ef4444",
          bg:      "#fee2e2",
          dark:    "#dc2626",
        },
        info: {
          DEFAULT: "#38bdf8",
          bg:      "#e0f2fe",
          dark:    "#0284c7",
        },

        surface: {
          base:    "rgb(var(--surface-base) / <alpha-value>)",      // page background
          raised:  "rgb(var(--surface-raised) / <alpha-value>)",    // cards, modals
          overlay: "rgb(var(--surface-overlay) / <alpha-value>)",   // dropdowns, tooltips
          sunken:  "rgb(var(--surface-sunken) / <alpha-value>)",    // input fields, code blocks
          dim:     "rgb(var(--surface-dim) / <alpha-value>)",       // hover state on surfaces
        },

        content: {
          primary:   "rgb(var(--content-primary) / <alpha-value>)",   // headings, body text
          secondary: "rgb(var(--content-secondary) / <alpha-value>)", // subtext, captions
          tertiary:  "rgb(var(--content-tertiary) / <alpha-value>)",  // placeholders, hints
          inverse:   "rgb(var(--content-inverse) / <alpha-value>)",   // text on accent bg
          disabled:  "rgb(var(--content-disabled) / <alpha-value>)",  // disabled state
        },

        ui: {
          border:       "rgb(var(--ui-border) / <alpha-value>)",        // default borders
          "border-strong": "rgb(var(--ui-border-strong) / <alpha-value>)", // emphasized borders
          "border-focus":  "rgb(var(--ui-border-focus) / <alpha-value>)",  // focus ring
          input:        "rgb(var(--ui-input) / <alpha-value>)",         // input background
          "input-hover":"rgb(var(--ui-input-hover) / <alpha-value>)",   // input hover
          skeleton:     "rgb(var(--ui-skeleton) / <alpha-value>)",      // skeleton loaders
        },

        idea: {
          open:     "#FEE440", // open / looking for dev — accent
          claimed:  "#38bdf8", // a developer claimed it
          building: "#a78bfa", // actively being built
          shipped:  "#22c55e", // launched / done
          archived: "#94a3b8", // archived / stale
        },
      },

      fontFamily: {
        sans:    ["Poppins", "sans-serif"],
        display: ["Poppins", "sans-serif"], // can swap for a display font later
      },
      fontSize: {
        "xs":    ["0.75rem",  { lineHeight: "1.4" }],
        "sm":    ["0.875rem", { lineHeight: "1.45" }],
        "base":  ["0.95rem",  { lineHeight: "1.55" }],
        "lg":    ["1.125rem", { lineHeight: "1.45" }],
        "xl":    ["1.25rem",  { lineHeight: "1.35" }],
        "2xl":   ["1.5rem",   { lineHeight: "1.25" }],
        "3xl":   ["1.875rem", { lineHeight: "1.2"  }],
        "4xl":   ["2.25rem",  { lineHeight: "1.15" }],
      },

      boxShadow: {
        "glow-accent": "0 0 0 3px rgba(254, 228, 64, 0.35)",

        "card-light":  "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06)",
        "card-dark":   "0 1px 3px rgba(0,0,0,0.3),  0 4px 16px rgba(0,0,0,0.3)",

        "raised-light":"0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
        "raised-dark": "0 4px 20px rgba(0,0,0,0.5),  0 1px 4px rgba(0,0,0,0.3)",

        "float-light": "0 8px 32px rgba(0,0,0,0.12)",
        "float-dark":  "0 8px 40px rgba(0,0,0,0.6)",

        "focus":       "0 0 0 3px rgba(56,189,248,0.4)",
      },

      borderRadius: {
        "badge": "6px",
        "card":  "14px",
        "modal": "18px",
        "pill":  "9999px",
      },

      transitionDuration: {
        "fast":   "120ms",
        "normal": "200ms",
        "slow":   "350ms",
      },
    },
  },
  plugins: [],
};
