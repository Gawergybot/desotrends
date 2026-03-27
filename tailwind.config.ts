import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#06080b",
        panel: "#0b1118",
        border: "#1b2532",
        muted: "#93a0b3",
        accent: "#3fa9f5"
      }
    }
  },
  plugins: []
};

export default config;
