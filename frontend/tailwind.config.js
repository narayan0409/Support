import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 40px 120px rgba(15, 23, 42, 0.35)"
      },
      colors: {
        surface: {
          950: "#050816"
        }
      }
    }
  },
  plugins: [forms]
} satisfies Config;
