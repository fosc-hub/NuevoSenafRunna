"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Header from "../../../components/Header"
import { useUser } from "@/utils/auth/userZustand"

// Dynamically import LegajoTable with no SSR to avoid hydration issues
const LegajoTable = dynamic(() => import("./ui/legajos-table"), { ssr: false })

export default function Page() {
  const router = useRouter()
  const user = useUser((state) => state.user)

  const isAdministracion = useMemo(() => {
    if (!user) return false
    const groupNames = (user.groups || []).map((g: any) => g.name.toLowerCase())
    return groupNames.some((n: string) => n.includes("administración") || n.includes("administracion"))
  }, [user])

  useEffect(() => {
    if (isAdministracion) {
      router.replace("/mesadeentrada")
    }
  }, [isAdministracion, router])

  if (isAdministracion) return null

  return (
    <>
      <Header type="legajos" />
      <div className="p-4 md:p-4">
        <LegajoTable />
      </div>
    </>
  )
}
