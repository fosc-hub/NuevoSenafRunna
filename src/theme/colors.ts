/**
 * Gobierno de Córdoba - Institutional Color Palette
 * Single source of truth for all color values across the application
 */

// =============================================================================
// RAW HEX VALUES
// =============================================================================

export const institutionalColors = {
  // Primary Blues
  azulPrincipal: "#00457F",    // Primary (header, buttons, primary actions)
  azulClaro: "#6CAEE5",        // Primary light (hover states, accents)
  azulMedio: "#2783D0",        // Secondary/Info (focus states, links)

  // Alert/Status Colors
  rojo: "#BC1734",             // Error
  dorado: "#CFA55B",           // Warning
  granate: "#9B182B",          // Error dark
  marron: "#9E752E",           // Warning dark

  // Neutral/Surface Colors
  grisClaro1: "#F5F5F5",       // Surface light
  grisClaro2: "#EFEBEA",       // Paper background

  // Semantic mappings
  primary: "#00457F",
  primaryLight: "#6CAEE5",
  primaryDark: "#003359",
  secondary: "#2783D0",
  secondaryLight: "#5BA3E0",
  secondaryDark: "#1A5A8F",
  error: "#BC1734",
  errorDark: "#9B182B",
  warning: "#CFA55B",
  warningDark: "#9E752E",
  success: "#4CAF50",
  successDark: "#388E3C",
  info: "#2783D0",
  infoDark: "#1A5A8F",
} as const

// =============================================================================
// MUI PALETTE CONFIGURATION
// =============================================================================

export const muiPalette = {
  primary: {
    main: institutionalColors.azulPrincipal,
    light: institutionalColors.azulClaro,
    dark: institutionalColors.primaryDark,
    contrastText: "#ffffff",
  },
  secondary: {
    main: institutionalColors.azulMedio,
    light: institutionalColors.secondaryLight,
    dark: institutionalColors.secondaryDark,
    contrastText: "#ffffff",
  },
  error: {
    main: institutionalColors.rojo,
    dark: institutionalColors.granate,
    light: "#E85A6F",
    contrastText: "#ffffff",
  },
  warning: {
    main: institutionalColors.dorado,
    dark: institutionalColors.marron,
    light: "#E0C080",
    contrastText: "#000000",
  },
  info: {
    main: institutionalColors.azulMedio,
    light: institutionalColors.azulClaro,
    dark: institutionalColors.infoDark,
    contrastText: "#ffffff",
  },
  success: {
    main: institutionalColors.success,
    dark: institutionalColors.successDark,
    light: "#81C784",
    contrastText: "#ffffff",
  },
  background: {
    default: "#ffffff",
    paper: institutionalColors.grisClaro2,
  },
  grey: {
    50: institutionalColors.grisClaro1,
    100: institutionalColors.grisClaro2,
    200: "#E0E0E0",
    300: "#BDBDBD",
    400: "#9E9E9E",
    500: "#757575",
    600: "#616161",
    700: "#424242",
    800: "#303030",
    900: "#212121",
  },
} as const

// =============================================================================
// TAILWIND COLOR EXTENSIONS
// =============================================================================

export const tailwindColors = {
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
    dark: institutionalColors.secondaryDark,
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
  // Accent (Azul Claro)
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
    DEFAULT: institutionalColors.success,
    light: "#81C784",
    dark: institutionalColors.successDark,
  },
  // Info
  info: {
    DEFAULT: institutionalColors.azulMedio,
    light: institutionalColors.azulClaro,
    dark: institutionalColors.infoDark,
  },
  // Surface
  surface: {
    light: institutionalColors.grisClaro1,
    DEFAULT: institutionalColors.grisClaro2,
  },
} as const

// =============================================================================
// GRADIENT UTILITIES
// =============================================================================

export const gradients = {
  // Primary gradient (header, buttons)
  primary: `linear-gradient(135deg, ${institutionalColors.azulPrincipal} 0%, ${institutionalColors.azulClaro} 100%)`,
  primaryHover: `linear-gradient(135deg, ${institutionalColors.primaryDark} 0%, ${institutionalColors.azulMedio} 100%)`,

  // Accent gradient
  accent: `linear-gradient(135deg, ${institutionalColors.azulMedio} 0%, ${institutionalColors.azulClaro} 100%)`,

  // Title/text gradient
  title: `linear-gradient(135deg, ${institutionalColors.azulPrincipal} 0%, ${institutionalColors.azulClaro} 100%)`,

  // Subtle backgrounds
  subtle: `linear-gradient(135deg, #ffffff 0%, ${institutionalColors.grisClaro1} 100%)`,

  // Success gradient
  success: `linear-gradient(135deg, ${institutionalColors.success} 0%, #81C784 100%)`,

  // Warning gradient
  warning: `linear-gradient(135deg, ${institutionalColors.dorado} 0%, #E0C080 100%)`,

  // Error gradient
  error: `linear-gradient(135deg, ${institutionalColors.rojo} 0%, #E85A6F 100%)`,
} as const

// =============================================================================
// SHADOW UTILITIES
// =============================================================================

export const shadows = {
  primary: `0 4px 12px rgba(0, 69, 127, 0.3)`,
  primaryHover: `0 6px 16px rgba(0, 69, 127, 0.4)`,
  accent: `0 4px 12px rgba(108, 174, 229, 0.3)`,
  accentHover: `0 6px 16px rgba(108, 174, 229, 0.4)`,
  subtle: `0 4px 20px rgba(0, 69, 127, 0.08)`,
} as const

// =============================================================================
// BORDER UTILITIES
// =============================================================================

export const borders = {
  primary: `1px solid rgba(0, 69, 127, 0.15)`,
  primaryHover: institutionalColors.azulClaro,
  accent: `1px solid rgba(108, 174, 229, 0.2)`,
  subtle: `1px solid rgba(0, 69, 127, 0.1)`,
} as const

// =============================================================================
// RGBA UTILITIES (for alpha variations)
// =============================================================================

export const rgba = {
  primary: (alpha: number) => `rgba(0, 69, 127, ${alpha})`,
  primaryLight: (alpha: number) => `rgba(108, 174, 229, ${alpha})`,
  secondary: (alpha: number) => `rgba(39, 131, 208, ${alpha})`,
  error: (alpha: number) => `rgba(188, 23, 52, ${alpha})`,
  warning: (alpha: number) => `rgba(207, 165, 91, ${alpha})`,
  success: (alpha: number) => `rgba(76, 175, 80, ${alpha})`,
} as const
