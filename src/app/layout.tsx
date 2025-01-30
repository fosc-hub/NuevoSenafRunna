import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";
import { QueryClientProvider } from "@tanstack/react-query";
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
        
      </body>
    </html>
  );
}
