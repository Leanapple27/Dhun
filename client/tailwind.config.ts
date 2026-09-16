import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#8b5cf6", // Dhun Violet
          hover: "#7c3aed",
        },
        surface: {
          DEFAULT: "#1e1e2e",
          hover: "#2a2a3c",
        },
        player: {
          DEFAULT: "#16161e",
        }
      },
    },
  },
  plugins: [],
};
export default config;
