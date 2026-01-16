import { ReactNode } from 'react'

interface AppointmentSectionProps {
  title: string
  count?: number
  children: ReactNode
  emptyMessage?: string
  emptyHint?: string
  priority?: boolean
}

export function AppointmentSection({
  title,
  count,
  children,
  emptyMessage,
  emptyHint,
  priority = false,
}: AppointmentSectionProps) {
  const isEmpty = count === 0

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h3 className={`font-semibold text-slate-900 ${priority ? 'text-lg' : 'text-base'}`}>
          {title}
        </h3>
        {count !== undefined && (
          <span className={`
            inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-semibold
            ${priority && count > 0 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-slate-100 text-slate-600'
            }
          `}>
            {count}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="py-8 px-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">{emptyMessage ?? 'No appointments'}</p>
          {emptyHint && <p className="text-xs text-slate-400 mt-1">{emptyHint}</p>}
        </div>
      ) : (
        <div className="grid gap-3">{children}</div>
      )}
    </section>
  )
}
