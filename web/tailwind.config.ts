import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--base-color)",
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        sub: "var(--sub-color)",
        accent: "var(--accent-color)",

        text: "var(--text-color)",
        form: "var(--text2-color)",
        gray: "var(--gray-color)",
        notification: "var(--notification-color)",
      },
    },
  },
  plugins: [],
};

export default config;
