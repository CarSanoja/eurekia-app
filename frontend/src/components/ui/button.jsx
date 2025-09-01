// Simple button component for UI consistency

export function Button({ 
  children, 
  variant = "default", 
  size = "default", 
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 bg-red-500 text-white hover:bg-red-600",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground border-gray-300 hover:bg-gray-50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-gray-100",
    link: "underline-offset-4 hover:underline text-blue-600"
  }
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  }
  
  const variantStyles = variants[variant] || variants.default
  const sizeStyles = sizes[size] || sizes.default
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}