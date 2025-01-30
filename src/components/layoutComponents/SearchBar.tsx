import React from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string

}
function onSearch(query: string) {
    console.log(query)
    }


export default function SearchBar({ placeholder = "Buscar" }: SearchBarProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const query = new FormData(form).get('search') as string
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        name="search"
        placeholder={placeholder}
        aria-label="Buscar en la aplicación"
        className="pl-10 pr-4 py-2 w-full bg-sky-400 text-white placeholder-sky-200 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
      />
      <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-200">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Buscar</span>
      </button>
    </form>
  )
}