"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Bell, LogOut, UserIcon, ChevronDown } from "lucide-react"
import UserAvatar from "./UserAvatar"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getSession, logout } from "@/utils/auth"
import { useUser } from "@/utils/auth/userZustand"
import { UserPermissions } from "@/utils/auth/userZustand"

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isClient, setIsClient] = useState(false)

  const user = useUser((state) => state.user) as UserPermissions | null

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    async function fetchUser() {
      if (!user || Object.keys(user).length === 0) {
        const userData = await getSession(true)
        if (userData && typeof userData === 'object') {
          useUser.setState({ user: userData as UserPermissions })
        }
      }
      setLoadingUser(false)
    }

    fetchUser()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      useUser.setState({ user: null }) // Reset Zustand state
      toast.success("Successfully logged out")
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Logout failed. Please try again.")
    }
  }

  if (!isClient || loadingUser) {
    return (
      <header
        className="text-white p-4 flex justify-between items-center h-[72px] shadow-md"
        style={{ background: 'linear-gradient(90deg, #00508C 0%, #006BA6 100%)' }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-32 h-10 bg-white/20 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-36 h-9 bg-white/20 rounded-md animate-pulse"></div>
          <div className="w-36 h-9 bg-white/20 rounded-md animate-pulse"></div>
          <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header
      className="text-white px-6 py-3 flex justify-between items-center shadow-md"
      style={{ background: 'linear-gradient(90deg, #00508C 0%, #006BA6 100%)' }}
    >
      {/* Logo RUNNA - Lado Izquierdo (Branding) */}
      <Link href="/mesadeentrada" className="flex-shrink-0 transition-opacity hover:opacity-90">
        <div className="relative h-12 w-44">
          <Image
            src="/img/PNG STICKER.png"
            alt="Logo RUNNA"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </Link>

      {/* Navegación y Usuario - Lado Derecho */}
      <div className="flex items-center gap-3">
        {/* Botones de Navegación */}
        <div className="flex gap-2">
          <Link
            href="/mesadeentrada"
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-[rgba(0,188,212,0.25)]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Mesa de Entradas
          </Link>
          <Link
            href="/legajo-mesa"
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-[rgba(0,188,212,0.25)]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Bandeja de legajos
          </Link>
        </div>

        {/* Notificaciones */}
        <button
          className="p-2 rounded-full transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <Bell size={20} />
        </button>

        {/* Avatar y Menú de Usuario */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {user?.first_name && user?.last_name
                  ? `${user.first_name[0]}${user.last_name[0]}`
                  : "?"}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : "Invitado"}
                </div>
                <div className="text-xs opacity-80">
                  {user?.groups?.[0]?.name || "Sin rol"}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
              style={{
                border: '1px solid rgba(0, 188, 212, 0.2)',
              }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
              >
                <LogOut size={18} className="text-red-600" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
