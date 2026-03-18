"use client";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalStyles } from "@mui/material";
import theme from "@/theme/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={{
          "html, body, *": {
            fontFamily: '"Roboto", var(--font-roboto), sans-serif !important',
          },
          "h1, h2, h3, h4, h5, h6, .MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6, .MuiButton-root, .MuiTab-root, .MuiDialogTitle-root": {
            fontFamily: '"Poppins", var(--font-poppins), sans-serif !important',
          },
        }}
      />
      {children}
    </MuiThemeProvider>
  );
}
