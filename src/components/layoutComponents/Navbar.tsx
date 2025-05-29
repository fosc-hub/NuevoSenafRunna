"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, LogOut, UserIcon } from "lucide-react"
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
        if (userData) {
          useUser.setState({ user: userData })
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
      <header className="bg-sky-500 text-white p-4 flex justify-between items-center h-[72px]">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-sky-400 rounded-full animate-pulse"></div>
          <div className="h-4 w-24 bg-sky-400 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-40 h-8 bg-sky-400 rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-sky-400 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-sky-400 rounded animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-sky-500 text-white p-4 flex justify-between items-center">
      <Link href="/mesadeentrada">
        <UserAvatar
          initials={user?.first_name && user?.last_name ? `${user.first_name[0]}${user.last_name[0]}` : "?"}
          name={user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Invitado"}
          role={user?.groups?.[0]?.name || "Sin rol"}
        />
      </Link>

      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <Link href="/mesadeentrada">
            <button className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Mesa de Entrada
            </button>
          </Link>
          <Link href="/legajo-mesa">
            <button className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Legajo Mesa
            </button>
          </Link>
        </div>
        <Bell size={24} className="cursor-pointer hover:text-sky-200 transition-colors" />
        <div className="relative" onClick={() => setShowMenu(!showMenu)}>
          <button className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded text-sm transition-colors">
            <UserIcon size={18} />
            <span>Menu</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
