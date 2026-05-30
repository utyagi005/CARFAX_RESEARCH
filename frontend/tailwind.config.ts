import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        line: "#D9E2EC",
        brand: "#2563EB",
        success: "#0F9F6E",
        warning: "#B7791F",
        danger: "#D92D20",
      },
      boxShadow: {
        soft: "0 12px 34px rgba(31, 41, 55, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;

