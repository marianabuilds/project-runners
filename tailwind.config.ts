import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--paper) / <alpha-value>)",
        foreground: "rgb(var(--ink) / <alpha-value>)",
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", muted: "rgb(var(--ink-muted) / <alpha-value>)", soft: "rgb(var(--ink-soft) / <alpha-value>)" },
        navy: {
          DEFAULT: "rgb(var(--navy) / <alpha-value>)",
          50: "rgb(var(--navy-50) / <alpha-value>)",
          100: "rgb(var(--navy-100) / <alpha-value>)",
          200: "rgb(var(--navy-200) / <alpha-value>)",
          600: "rgb(var(--navy-600) / <alpha-value>)",
        },
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        sky: {
          DEFAULT: "rgb(var(--sky) / <alpha-value>)",
          100: "rgb(var(--sky-100) / <alpha-value>)",
          300: "rgb(var(--sky-300) / <alpha-value>)",
        },
        accent: "#FFF200",
        "on-accent": "#303841",
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Avenir', 'var(--font-fallback)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
