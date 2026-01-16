import { AppointmentStatusType } from '@domain/appointment'

interface StatusBadgeProps {
  status: AppointmentStatusType
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<AppointmentStatusType, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 ring-red-600/20',
  },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${sizeClasses} ${config.className}`}>
      {config.label}
    </span>
  )
}
