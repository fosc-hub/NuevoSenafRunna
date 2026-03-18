import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";
import ReactQueryProvider from "@/utils/providers/reactQueryProvider";
import ThemeProvider from "@/utils/providers/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Runna",
  description: "Pagina de registro unico nacional de niños y niñoas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isSupabaseMode = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <ThemeProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Slide}
          />

          <ReactQueryProvider>{children}</ReactQueryProvider>

          {/* Badge visible solo con .env.local activo */}
          {isSupabaseMode && (
            <div
              style={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 9999,
                background: '#3ecf8e',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 8px rgba(62,207,142,0.4)',
                userSelect: 'none',
                fontFamily: 'monospace',
              }}
              title="Conectado a Supabase. Eliminar .env.local para restaurar Railway."
            >
              🛰️ MODO SUPABASE
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
