/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:          "#F4F5F7",
        card:        "#FFFFFF",
        border:      "#E5E7EB",
        "dark-bg":   "#0F1117",
        "dark-card": "#1A1D27",
        "dark-border":"#2A2D3E",
        sidebar:     "#111318",
        primary: {
          DEFAULT: "#5B6AF0",
          light:   "#EEF0FE",
          dark:    "#4A5ADF",
        },
        success: { DEFAULT: "#22C55E", light: "#DCFCE7" },
        danger:  { DEFAULT: "#EF4444", light: "#FEE2E2" },
        warn:    { DEFAULT: "#F59E0B", light: "#FEF3C7" },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans:    ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
