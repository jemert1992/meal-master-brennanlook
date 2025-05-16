import * as React from "react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light")
  }, [theme, setTheme])

  return (
    <button 
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 p-1 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:hover:bg-gray-600"
      aria-label="Toggle theme"
    >
      <span 
        className={`${
          theme === "dark" ? "translate-x-6" : "translate-x-0"
        } inline-block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform dark:bg-gray-800`}
      >
        {theme === "dark" ? (
          <i className="fa-solid fa-moon text-primary text-xs flex items-center justify-center h-full"></i>
        ) : (
          <i className="fa-solid fa-sun text-amber-500 text-xs flex items-center justify-center h-full"></i>
        )}
      </span>
    </button>
  )
}