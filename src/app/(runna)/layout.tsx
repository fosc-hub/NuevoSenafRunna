import type React from "react"
import Navbar from "@/components/layoutComponents/Navbar"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      {children}
    </div>
  )
}

