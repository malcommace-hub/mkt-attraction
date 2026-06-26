import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2ECC71",
          50: "#EAFBF1",
          100: "#D2F6E0",
          200: "#A6EDC1",
          300: "#79E4A2",
          400: "#53D98A",
          500: "#2ECC71",
          600: "#25A35B",
          700: "#1C7A44",
          800: "#13522D",
          900: "#0A2917",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.06)",
        card: "0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px rgba(16, 24, 40, 0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          "0%": { opacity: "0", maxHeight: "0" },
          "100%": { opacity: "1", maxHeight: "2000px" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "accordion-down": "accordion-down 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
