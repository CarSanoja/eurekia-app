// Simple badge component for UI consistency

export function Badge({ 
  children, 
  variant = "default", 
  className = "",
  ...props 
}) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-gray-900 text-white hover:bg-gray-800",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 bg-red-500 text-white",
    outline: "text-foreground border-gray-300 text-gray-900",
    success: "border-transparent bg-green-500 text-white",
    warning: "border-transparent bg-yellow-500 text-white",
    info: "border-transparent bg-blue-500 text-white"
  }
  
  const variantStyles = variants[variant] || variants.default
  
  return (
    <span
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}