import { Appointment } from '@domain/appointment'
import { StatusBadge } from './status-badge'

export interface AppointmentCardAction {
  label: string
  onClick: () => void
  variant: 'danger' | 'warning' | 'success' | 'primary'
}

interface AppointmentCardProps {
  appointment: Appointment
  patientName?: string
  providerName?: string
  actions?: AppointmentCardAction[]
  showPatient?: boolean
  showProvider?: boolean
  highlighted?: boolean
}

const ACTION_STYLES: Record<AppointmentCardAction['variant'], string> = {
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
  warning: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
  primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200',
}

export function AppointmentCard({
  appointment,
  patientName,
  providerName,
  actions = [],
  showPatient = true,
  showProvider = true,
  highlighted = false,
}: AppointmentCardProps) {
  const dateFormatted = appointment.timeSlot.startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const timeFormatted = appointment.timeSlot.formatted()

  return (
    <div className={`
      bg-white rounded-lg border p-4 
      ${highlighted ? 'border-primary-200 ring-1 ring-primary-100' : 'border-slate-200'}
    `}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <StatusBadge status={appointment.status.value} />
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{dateFormatted}</p>
          <p className="text-xs text-slate-500 font-mono">{timeFormatted}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {showPatient && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-16">Patient</span>
            <span className="text-slate-900 font-medium">{patientName ?? appointment.patientId}</span>
          </div>
        )}
        {showProvider && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-16">Provider</span>
            <span className="text-slate-900 font-medium">{providerName ?? appointment.providerId}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-slate-500 w-16">Reason</span>
          <span className="text-slate-700">{appointment.reason}</span>
        </div>
        {appointment.notes && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-slate-500 w-16">Notes</span>
            <span className="text-slate-600 italic">{appointment.notes}</span>
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md border transition-colors
                ${ACTION_STYLES[action.variant]}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
