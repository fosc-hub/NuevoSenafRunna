import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";
import ReactQueryProvider from "@/utils/providers/reactQueryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
      </body>
    </html>
  );
}
