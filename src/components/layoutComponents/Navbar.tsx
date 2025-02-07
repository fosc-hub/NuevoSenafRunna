"use client"

import Link from "next/link" // Make sure to import Link
import { useEffect, useState } from "react"
import { Bell, LogOut, UserIcon } from "lucide-react"
import UserAvatar from "./UserAvatar"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { logout } from "@/utils/auth"
import type { TUser } from "@/app/interfaces"
import SearchBar from "./SearchBar"
import { useUser } from "@/utils/auth/userZustand"

interface TParams extends TUser {
  initials: string
  name: string
  role: string
}

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const user: any = useUser((state: any) => state.user)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user) {
      setLoadingUser(false)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Successfully logged out")
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Logout failed. Please try again.")
    }
  }

  if (loadingUser) {
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
      {/* Wrap UserAvatar in a Link so it’s clickable */}
      <Link href="/mesadeentrada">
        <UserAvatar
          initials={user.initials}
          name={user.name}
          role={user.groups && user.groups.length > 0 ? user.groups[0].name : "Sin rol"}
        />
      </Link>

      <div className="flex items-center space-x-4">
        <SearchBar />
        <Bell size={24} />
        <div className="relative">
          <button
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded text-sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <UserIcon size={18} />
            <span>Menu</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
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
