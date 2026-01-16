import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/auth-context'
import { useRepositories } from '../contexts/repositories-context'
import { useAppointmentsWithDetails, AppointmentWithDetails } from '../hooks/use-appointments-with-details'
import { AppointmentSection } from './appointment-section'
import { AppointmentCard, AppointmentCardAction } from './appointment-card'
import { ErrorDisplay } from './error-display'
import { DashboardCard, DashboardCardContent } from './dashboard-card'
import { Modal } from './modal'
import { ScheduleAppointmentForm } from './schedule-appointment-form'

interface GroupedAppointments {
  scheduled: AppointmentWithDetails[]
  inProgress: AppointmentWithDetails[]
  completed: AppointmentWithDetails[]
  cancelled: AppointmentWithDetails[]
}

interface StatCardProps {
  label: string
  value: number
  color: 'blue' | 'amber' | 'emerald' | 'red'
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  )
}

export function AdminDashboard() {
  const { currentUser } = useAuth()
  const { isInitialized } = useRepositories()
  const { appointments, loading, error, loadAppointments, cancel } = useAppointmentsWithDetails()
  const [actionError, setActionError] = useState<string | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    if (isInitialized && currentUser) {
      loadAppointments()
    }
  }, [isInitialized, currentUser, loadAppointments])

  const grouped = useMemo((): GroupedAppointments => {
    const result: GroupedAppointments = {
      scheduled: [],
      inProgress: [],
      completed: [],
      cancelled: [],
    }

    appointments.forEach((apt) => {
      if (apt.status.isScheduled()) {
        result.scheduled.push(apt)
      } else if (apt.status.isInProgress()) {
        result.inProgress.push(apt)
      } else if (apt.status.isCompleted()) {
        result.completed.push(apt)
      } else if (apt.status.isCancelled()) {
        result.cancelled.push(apt)
      }
    })

    const sortByTime = (a: AppointmentWithDetails, b: AppointmentWithDetails) =>
      a.timeSlot.startTime.getTime() - b.timeSlot.startTime.getTime()

    result.scheduled.sort(sortByTime)
    result.inProgress.sort(sortByTime)
    result.completed.sort((a, b) => b.timeSlot.startTime.getTime() - a.timeSlot.startTime.getTime())
    result.cancelled.sort((a, b) => b.timeSlot.startTime.getTime() - a.timeSlot.startTime.getTime())

    return result
  }, [appointments])

  const handleCancel = async (appointmentId: string) => {
    setActionError(null)
    const success = await cancel(appointmentId)
    if (!success) {
      setActionError('Failed to cancel appointment')
    }
  }

  const handleScheduleSuccess = () => {
    setIsScheduleModalOpen(false)
    loadAppointments()
  }

  const getActions = (apt: AppointmentWithDetails): AppointmentCardAction[] => {
    const actions: AppointmentCardAction[] = []

    if (apt.status.isScheduled()) {
      actions.push({
        label: 'Cancel',
        onClick: () => handleCancel(apt.id),
        variant: 'danger',
      })
    }

    return actions
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-3 animate-spin" />
          <p className="text-slate-500 text-sm">Loading system overview...</p>
        </div>
      </div>
    )
  }

  const totalActive = grouped.scheduled.length + grouped.inProgress.length

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">System Overview</h1>
          <p className="text-slate-500 mt-1">
            {appointments.length} total appointments • {totalActive} active
          </p>
        </div>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg shadow-primary-600/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Schedule Appointment
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Scheduled" value={grouped.scheduled.length} color="blue" />
        <StatCard label="In Progress" value={grouped.inProgress.length} color="amber" />
        <StatCard label="Completed" value={grouped.completed.length} color="emerald" />
        <StatCard label="Cancelled" value={grouped.cancelled.length} color="red" />
      </div>

      <ErrorDisplay error={error} />

      {actionError && (
        <div className="flex items-center justify-between gap-4 p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-amber-700">{actionError}</p>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {grouped.inProgress.length > 0 && (
        <DashboardCard className="mb-8 border-amber-200 bg-amber-50/30">
          <DashboardCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">In Progress</h2>
                <p className="text-sm text-slate-600">{grouped.inProgress.length} appointment{grouped.inProgress.length > 1 ? 's' : ''} currently active</p>
              </div>
            </div>
            <div className="grid gap-3">
              {grouped.inProgress.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  patientName={apt.patientName}
                  providerName={apt.providerName}
                  showPatient
                  showProvider
                  highlighted
                />
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <AppointmentSection
            title="Scheduled"
            count={grouped.scheduled.length}
            emptyMessage="No scheduled appointments"
            emptyHint="New appointments will appear here"
            priority={grouped.inProgress.length === 0}
          >
            {grouped.scheduled.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                patientName={apt.patientName}
                providerName={apt.providerName}
                showPatient
                showProvider
                actions={getActions(apt)}
              />
            ))}
          </AppointmentSection>
        </div>

        <div>
          <AppointmentSection
            title="Completed"
            count={grouped.completed.length}
            emptyMessage="No completed appointments"
          >
            {grouped.completed.slice(0, 5).map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                patientName={apt.patientName}
                providerName={apt.providerName}
                showPatient
                showProvider
              />
            ))}
            {grouped.completed.length > 5 && (
              <p className="text-center text-sm text-slate-500 py-2">
                And {grouped.completed.length - 5} more completed appointments...
              </p>
            )}
          </AppointmentSection>

          <AppointmentSection
            title="Cancelled"
            count={grouped.cancelled.length}
            emptyMessage="No cancelled appointments"
          >
            {grouped.cancelled.slice(0, 3).map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                patientName={apt.patientName}
                providerName={apt.providerName}
                showPatient
                showProvider
              />
            ))}
            {grouped.cancelled.length > 3 && (
              <p className="text-center text-sm text-slate-500 py-2">
                And {grouped.cancelled.length - 3} more cancelled appointments...
              </p>
            )}
          </AppointmentSection>
        </div>
      </div>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Appointment"
      >
        <ScheduleAppointmentForm
          onSuccess={handleScheduleSuccess}
          onCancel={() => setIsScheduleModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
