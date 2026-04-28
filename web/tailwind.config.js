/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        earth: {
          50: "#faf8f1",
          100: "#f1ead8",
          200: "#e2d4ad",
          300: "#cfb87b",
          400: "#bd9c50",
          500: "#a97f35",
          600: "#8b6229",
          700: "#714b25",
          800: "#603f26",
          900: "#523623",
        },
        leaf: {
          50: "#eefdf3",
          100: "#d8f8e2",
          200: "#b4efc9",
          300: "#7fe1a5",
          400: "#46c97b",
          500: "#22a95d",
          600: "#168747",
          700: "#146b3b",
          800: "#135632",
          900: "#10472c",
        },
        sun: {
          50: "#fffbeb",
          100: "#fef0c7",
          200: "#fedf89",
          300: "#fec84b",
          400: "#fdb022",
          500: "#f79009",
          600: "#dc6803",
          700: "#b54708",
          800: "#93370d",
          900: "#792e0d",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(39, 68, 45, 0.12)",
        lift: "0 12px 30px rgba(15, 23, 42, 0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
