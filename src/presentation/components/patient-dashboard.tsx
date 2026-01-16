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

function isUpcoming(apt: AppointmentWithDetails): boolean {
  const now = new Date()
  return apt.timeSlot.startTime > now && (apt.status.isScheduled() || apt.status.isInProgress())
}

function isPast(apt: AppointmentWithDetails): boolean {
  return apt.status.isCompleted() || apt.status.isCancelled()
}

export function PatientDashboard() {
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

  const { upcoming, past } = useMemo(() => {
    const upcoming: AppointmentWithDetails[] = []
    const past: AppointmentWithDetails[] = []

    appointments.forEach((apt) => {
      if (isUpcoming(apt)) {
        upcoming.push(apt)
      } else if (isPast(apt)) {
        past.push(apt)
      }
    })

    upcoming.sort((a, b) => a.timeSlot.startTime.getTime() - b.timeSlot.startTime.getTime())
    past.sort((a, b) => b.timeSlot.startTime.getTime() - a.timeSlot.startTime.getTime())

    return { upcoming, past }
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
        label: 'Cancel Appointment',
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
          <p className="text-slate-500 text-sm">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  const firstName = currentUser?.name?.split(' ')[0] ?? 'there'

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-500 mt-1">
            {upcoming.length > 0 
              ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}`
              : 'You have no upcoming appointments'
            }
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

      {upcoming.length === 0 && past.length === 0 ? (
        <DashboardCard className="text-center py-12">
          <DashboardCardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No appointments yet</h3>
            <p className="text-slate-500 text-sm mb-6">Schedule your first appointment to get started with CareFlow</p>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Schedule Your First Appointment
            </button>
          </DashboardCardContent>
        </DashboardCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AppointmentSection
              title="Upcoming Appointments"
              count={upcoming.length}
              emptyMessage="No upcoming appointments"
              emptyHint="Schedule a new appointment to get started"
              priority
            >
              {upcoming.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  providerName={apt.providerName}
                  showPatient={false}
                  showProvider
                  actions={getActions(apt)}
                  highlighted={apt.status.isInProgress()}
                />
              ))}
            </AppointmentSection>
          </div>

          <div>
            <AppointmentSection
              title="Past Appointments"
              count={past.length}
              emptyMessage="No appointment history"
              emptyHint="Your completed and cancelled appointments will appear here"
            >
              {past.slice(0, 5).map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  providerName={apt.providerName}
                  showPatient={false}
                  showProvider
                />
              ))}
              {past.length > 5 && (
                <p className="text-center text-sm text-slate-500 py-2">
                  And {past.length - 5} more past appointments...
                </p>
              )}
            </AppointmentSection>
          </div>
        </div>
      )}

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
