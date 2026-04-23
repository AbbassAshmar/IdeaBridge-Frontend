/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f1420",
        panel: "#11192a",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(37, 99, 235, 0.24)",
      },
    },
  },
  plugins: [],
};
