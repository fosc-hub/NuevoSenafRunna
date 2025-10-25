/**
 * Avatar utility functions for generating initials and colors
 * Used by adulto-card and nnya-card components
 */

/**
 * Get initials from first name and last name
 * @param name First name
 * @param surname Last name
 * @returns Uppercase initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name: string, surname: string): string => {
  const firstInitial = name?.charAt(0) || ""
  const lastInitial = surname?.charAt(0) || ""
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

/**
 * Get avatar color based on index
 * Cycles through a predefined color palette
 * @param index Index number (typically from array position)
 * @returns Hex color code
 */
export const getAvatarColor = (index: number): string => {
  const colors = [
    "#1976d2", // blue
    "#388e3c", // green
    "#d32f2f", // red
    "#7b1fa2", // purple
    "#f57c00", // orange
    "#0288d1", // light blue
    "#c2185b", // pink
    "#455a64", // blue grey
    "#512da8", // deep purple
    "#00796b", // teal
  ]
  return colors[index % colors.length]
}
