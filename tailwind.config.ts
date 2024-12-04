import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        sky: {
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        stone: {
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
        },
        neutral: {
          500: "#737373",
          600: "#525252",
          700: "#404040",
        },
        slate: {
          500: "#64748b",
          600: "#475569",
          700: "#334155",
        },
      },
    },
  },
  plugins: [],
};

export default config;
