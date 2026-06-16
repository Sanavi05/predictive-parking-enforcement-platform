import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#121826",
        surface: "#0c111d",
        line: "#243044",
        signal: "#20d3a2",
      },
      boxShadow: {
        glow: "0 0 28px rgba(32, 211, 162, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
