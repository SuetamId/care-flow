import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/auth-context'
import { useRepositories } from '../contexts/repositories-context'
import { useAppointmentsWithDetails, AppointmentWithDetails } from '../hooks/use-appointments-with-details'
import { AppointmentSection } from './appointment-section'
import { AppointmentCard, AppointmentCardAction } from './appointment-card'
import { ErrorDisplay } from './error-display'
import { DashboardCard, DashboardCardContent } from './dashboard-card'

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isFuture(date: Date): boolean {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date > today
}

export function ProviderDashboard() {
  const { currentUser } = useAuth()
  const { isInitialized } = useRepositories()
  const { appointments, loading, error, loadAppointments, start, complete } =
    useAppointmentsWithDetails()
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (isInitialized && currentUser) {
      loadAppointments()
    }
  }, [isInitialized, currentUser, loadAppointments])

  const { inProgress, today, upcoming } = useMemo(() => {
    const inProgress: AppointmentWithDetails[] = []
    const today: AppointmentWithDetails[] = []
    const upcoming: AppointmentWithDetails[] = []

    appointments.forEach((apt) => {
      if (apt.status.isInProgress()) {
        inProgress.push(apt)
      } else if (apt.status.isScheduled()) {
        if (isToday(apt.timeSlot.startTime)) {
          today.push(apt)
        } else if (isFuture(apt.timeSlot.startTime)) {
          upcoming.push(apt)
        }
      }
    })

    const sortByTime = (a: AppointmentWithDetails, b: AppointmentWithDetails) =>
      a.timeSlot.startTime.getTime() - b.timeSlot.startTime.getTime()

    inProgress.sort(sortByTime)
    today.sort(sortByTime)
    upcoming.sort(sortByTime)

    return { inProgress, today, upcoming }
  }, [appointments])

  const handleStart = async (appointmentId: string) => {
    setActionError(null)
    const success = await start(appointmentId)
    if (!success) {
      setActionError('Failed to start appointment')
    }
  }

  const handleComplete = async (appointmentId: string) => {
    setActionError(null)
    const success = await complete(appointmentId)
    if (!success) {
      setActionError('Failed to complete appointment')
    }
  }

  const getActions = (apt: AppointmentWithDetails): AppointmentCardAction[] => {
    const actions: AppointmentCardAction[] = []

    if (apt.status.isScheduled()) {
      actions.push({
        label: 'Start Appointment',
        onClick: () => handleStart(apt.id),
        variant: 'primary',
      })
    }

    if (apt.status.isInProgress()) {
      actions.push({
        label: 'Complete Appointment',
        onClick: () => handleComplete(apt.id),
        variant: 'success',
      })
    }

    return actions
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-3 animate-spin" />
          <p className="text-slate-500 text-sm">Loading your schedule...</p>
        </div>
      </div>
    )
  }

  const totalToday = inProgress.length + today.length
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {greeting}, {currentUser?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          {totalToday > 0
            ? `You have ${totalToday} appointment${totalToday > 1 ? 's' : ''} today`
            : 'No appointments scheduled for today'}
        </p>
      </div>

      {inProgress.length > 0 && (
        <DashboardCard className="mb-8 border-amber-200 bg-amber-50/30">
          <DashboardCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Appointment In Progress</h2>
                <p className="text-sm text-slate-600">Focus on your current patient</p>
              </div>
            </div>
            <div className="grid gap-3">
              {inProgress.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  patientName={apt.patientName}
                  showPatient
                  showProvider={false}
                  actions={getActions(apt)}
                  highlighted
                />
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <AppointmentSection
            title="Today's Schedule"
            count={today.length}
            emptyMessage="No more appointments today"
            emptyHint={inProgress.length > 0 ? 'Focus on your current appointment' : 'Enjoy your free time'}
            priority={inProgress.length === 0}
          >
            {today.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                patientName={apt.patientName}
                showPatient
                showProvider={false}
                actions={getActions(apt)}
              />
            ))}
          </AppointmentSection>
        </div>

        <div>
          <AppointmentSection
            title="Upcoming Appointments"
            count={upcoming.length}
            emptyMessage="No upcoming appointments"
            emptyHint="Future scheduled appointments will appear here"
          >
            {upcoming.slice(0, 5).map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                patientName={apt.patientName}
                showPatient
                showProvider={false}
                actions={getActions(apt)}
              />
            ))}
            {upcoming.length > 5 && (
              <p className="text-center text-sm text-slate-500 py-2">
                And {upcoming.length - 5} more upcoming appointments...
              </p>
            )}
          </AppointmentSection>
        </div>
      </div>
    </div>
  )
}
