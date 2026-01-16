import { ReactNode } from 'react'

interface DashboardCardProps {
  children: ReactNode
  className?: string
}

export function DashboardCard({ children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

interface DashboardCardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function DashboardCardHeader({ title, subtitle, action }: DashboardCardHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface DashboardCardContentProps {
  children: ReactNode
  className?: string
}

export function DashboardCardContent({ children, className = '' }: DashboardCardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}
