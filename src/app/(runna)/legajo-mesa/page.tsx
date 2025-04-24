"use client"

import dynamic from "next/dynamic"
import Header from "../../../components/Header"

// Dynamically import LegajoTable with no SSR to avoid hydration issues
const LegajoTable = dynamic(() => import("./ui/legajos-table"), { ssr: false })

export default function Page() {
  return (
    <>
      <Header type="legajos" />
      <div className="p-4 md:p-4">
        <LegajoTable />
      </div>
    </>
  )
}
