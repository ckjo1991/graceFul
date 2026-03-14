import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        card: {
          grateful: "#EAF5EE",
          "grateful-border": "#C5E3D0",
          "grateful-dark": "#182A20",
          "grateful-border-dark": "#2A4632",
          struggling: "#FEF0EB",
          "struggling-border": "#F5C5B5",
          "struggling-dark": "#2A1810",
          "struggling-border-dark": "#46281E",
          owned: "#FEFAEC",
          "owned-border": "#F0DFA0",
          "owned-dark": "#26200E",
          "owned-border-dark": "#463C16",
        },
        primary: {
          DEFAULT: "#4a7c59",
          dark: "#2e5c3a",
        },
        bg: {
          warm: "#f5f2ee",
        },
        struggle: {
          DEFAULT: "#7c5a4a",
        },
        accent: "#a8c5a0",
        muted: "#8fad88",
        text: {
          DEFAULT: "#2c3a2e",
          body: "#555555",
          /* AA-safe: 5.89:1 on #E8E4DE */
          light: "#526457",
        },
        border: "#c8bea7",
        crisis: "#c0392b",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
