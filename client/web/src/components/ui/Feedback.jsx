import { Loader2 } from 'lucide-react'

export function Spinner({ size = 24, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-emerald-600 ${className}`} />
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner size={32} />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 px-4 text-center">
      {Icon && <Icon size={48} className="text-slate-300" />}
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  )
}
