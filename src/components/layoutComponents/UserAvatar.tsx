import React from 'react'

interface UserAvatarProps {
  initials: string
  name: string
  role: string
  bgColor?: string
}

export default function UserAvatar({ initials, name, role, bgColor = 'bg-white' }: UserAvatarProps) {
  return (
    <div className="flex items-center space-x-3">
      <div 
        className={`w-10 h-10 ${bgColor} text-sky-500 rounded-full flex items-center justify-center font-bold text-xl`}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div className="text-white">
        <h2 className="font-semibold">{name}</h2>
        <p className="text-sm">
          <span className="sr-only">Rol: </span>{role} | 
        </p>
      </div>
    </div>
  )
}