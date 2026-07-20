const ICONS = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

const STYLES = {
  success: 'bg-white dark:bg-dark-card border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300',
  warning: 'bg-white dark:bg-dark-card border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300',
  error: 'bg-white dark:bg-dark-card border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300',
}

export default function Toast({ toast, onRemove }) {
  const type = toast.type || 'success'
  const toastStyle = STYLES[type] || STYLES.success

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-lg animate-fade-in font-poppins text-xs font-semibold ${toastStyle}`}
      role="alert"
    >
      <span className="text-sm">{ICONS[type]}</span>
      <span>{toast.message}</span>
      <button 
        className="ml-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer" 
        onClick={() => onRemove(toast.id)} 
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
