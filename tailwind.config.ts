import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F5",
        foreground: "#303841",
        navy: "#303841",
        "navy-50": "#F0F1F2",
        "navy-100": "#D4D8DD",
        "navy-200": "#8A929C",
        "navy-600": "#4D5866",
        "sky-300": "#B9D2E5",
        sky: "#D6E6F2",
        "sky-100": "#E8F2F9",
        paper: "#F5F5F5",
        accent: "#FFF200",
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Avenir', 'var(--font-fallback)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
