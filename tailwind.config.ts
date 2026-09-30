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
        // Brand: miel (#F5DD7B) and café (#83580B)
        miel: {
          50: "#FEFBEF",
          100: "#FCF4D3",
          200: "#F9EBAE",
          300: "#F5DD7B",
          400: "#EBC94F",
        },
        cafe: {
          300: "#C9A15A",
          500: "#A06E14",
          600: "#83580B",
          700: "#6B4709",
          800: "#523607",
          900: "#3A2605",
        },
        crema: "#FFFDF7",
      },
      fontFamily: {
        heading: ["'Cal Sans'", "var(--font-body)", "sans-serif"],
        body: ["var(--font-body)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
