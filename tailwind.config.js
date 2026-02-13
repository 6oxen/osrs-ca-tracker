/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core dark theme tokens (wiseoldman-like)
        "bg-primary": "#0d1117", // bg-slate-950 equivalent
        "card-bg": "#161b22", // bg-slate-900 equivalent
        "ui-border": "#1f2937", // gray-800-ish
        "ui-hover": "#0f1724",
        // legacy tier colors preserved
        "osrs-easy": "#8bc34a",
        "osrs-medium": "#ffeb3b",
        "osrs-hard": "#ff9800",
        "osrs-elite": "#f44336",
        "osrs-master": "#9c27b0",
        "osrs-grandmaster": "#673ab7",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Helvetica", "Arial", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(8px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideIn: {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
