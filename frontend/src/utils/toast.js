// Simple toast utility to replace sonner
const toast = {
  success: (message) => {
    console.log('✅ Success:', message)
    // In a real app, you'd implement actual toast notifications
    // For now, we'll just log to console
  },
  error: (message) => {
    console.log('❌ Error:', message)
  },
  info: (message) => {
    console.log('ℹ️ Info:', message)
  },
  warning: (message) => {
    console.log('⚠️ Warning:', message)
  }
}

export { toast }