import type { Config } from "tailwindcss";

/**
 * Gobierno de Córdoba - Institutional Color Palette for Tailwind
 * Synchronized with src/theme/colors.ts
 */
const institutionalColors = {
  // Primary Blues
  azulPrincipal: "#00457F",
  azulClaro: "#6CAEE5",
  azulMedio: "#2783D0",
  primaryDark: "#003359",

  // Alert/Status Colors
  rojo: "#BC1734",
  dorado: "#CFA55B",
  granate: "#9B182B",
  marron: "#9E752E",

  // Neutral/Surface Colors
  grisClaro1: "#F5F5F5",
  grisClaro2: "#EFEBEA",
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Primary
        primary: {
          DEFAULT: institutionalColors.azulPrincipal,
          light: institutionalColors.azulClaro,
          dark: institutionalColors.primaryDark,
          50: "#E6EEF5",
          100: "#CCDCE9",
          200: "#99B9D4",
          300: "#6696BF",
          400: "#3373AA",
          500: institutionalColors.azulPrincipal,
          600: "#003A6B",
          700: "#002E57",
          800: "#002343",
          900: "#00172F",
        },
        // Secondary
        secondary: {
          DEFAULT: institutionalColors.azulMedio,
          light: institutionalColors.azulClaro,
          dark: "#1A5A8F",
          50: "#E9F3FB",
          100: "#D3E7F7",
          200: "#A7CFEF",
          300: "#7BB7E7",
          400: "#4F9FDF",
          500: institutionalColors.azulMedio,
          600: "#1F68A6",
          700: "#184D7D",
          800: "#103354",
          900: "#08192A",
        },
        // Accent
        accent: {
          DEFAULT: institutionalColors.azulClaro,
          light: "#8EC5ED",
          dark: "#4A97D5",
        },
        // Error
        error: {
          DEFAULT: institutionalColors.rojo,
          light: "#E85A6F",
          dark: institutionalColors.granate,
        },
        // Warning
        warning: {
          DEFAULT: institutionalColors.dorado,
          light: "#E0C080",
          dark: institutionalColors.marron,
        },
        // Success
        success: {
          DEFAULT: "#4CAF50",
          light: "#81C784",
          dark: "#388E3C",
        },
        // Info
        info: {
          DEFAULT: institutionalColors.azulMedio,
          light: institutionalColors.azulClaro,
          dark: "#1A5A8F",
        },
        // Surface
        surface: {
          light: institutionalColors.grisClaro1,
          DEFAULT: institutionalColors.grisClaro2,
        },
      },
      fontFamily: {
        sans: ["Poppins", "var(--font-poppins)", "sans-serif"],
        body: ["Roboto", "var(--font-roboto)", "sans-serif"],
        heading: ["Poppins", "var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
