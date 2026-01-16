import { DomainError } from '@shared/errors'

interface ErrorDisplayProps {
  error: DomainError | null
  onDismiss?: () => void
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="flex items-center justify-between gap-4 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-mono text-red-600">{error.code}</p>
          <p className="text-sm text-red-700 mt-0.5">{error.message}</p>
        </div>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
