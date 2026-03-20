"use client";

import { createTheme } from "@mui/material/styles";
import { muiPalette } from "./colors";

// Font family constants - Google Fonts loaded via CDN + next/font CSS variables
const POPPINS = '"Poppins", var(--font-poppins), sans-serif';
const ROBOTO = '"Roboto", var(--font-roboto), sans-serif';

const theme = createTheme({
  palette: muiPalette,
  typography: {
    fontFamily: POPPINS,
    h1: {
      fontFamily: POPPINS,
      fontWeight: 600,
    },
    h2: {
      fontFamily: POPPINS,
      fontWeight: 600,
    },
    h3: {
      fontFamily: POPPINS,
      fontWeight: 600,
    },
    h4: {
      fontFamily: POPPINS,
      fontWeight: 600,
    },
    h5: {
      fontFamily: POPPINS,
      fontWeight: 500,
    },
    h6: {
      fontFamily: POPPINS,
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: ROBOTO,
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: ROBOTO,
      fontWeight: 500,
    },
    body1: {
      fontFamily: ROBOTO,
      fontWeight: 400,
    },
    body2: {
      fontFamily: ROBOTO,
      fontWeight: 400,
    },
    button: {
      fontFamily: POPPINS,
      fontWeight: 500,
      textTransform: "none",
    },
    caption: {
      fontFamily: ROBOTO,
      fontWeight: 400,
    },
    overline: {
      fontFamily: POPPINS,
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: ROBOTO,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: POPPINS,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            fontFamily: ROBOTO,
          },
          "& .MuiInputLabel-root": {
            fontFamily: ROBOTO,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: ROBOTO,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: ROBOTO,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: ROBOTO,
        },
        head: {
          fontFamily: POPPINS,
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: ROBOTO,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: POPPINS,
          fontWeight: 500,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: POPPINS,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
