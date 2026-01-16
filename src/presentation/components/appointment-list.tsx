import { useEffect, useState } from 'react'
import { Appointment, AppointmentStatusType } from '@domain/appointment'
import { Patient } from '@domain/patient'
import { Provider } from '@domain/provider'
import { useAuth } from '../contexts/auth-context'
import { useRepositories } from '../contexts/repositories-context'
import { useAppointments } from '../hooks/use-appointments'
import { ErrorDisplay } from './error-display'

const STATUS_LABELS: Record<AppointmentStatusType, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<AppointmentStatusType, string> = {
  scheduled: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
}

interface AppointmentWithDetails extends Appointment {
  patientName?: string
  providerName?: string
}

export function AppointmentList() {
  const { currentUser } = useAuth()
  const { patientRepository, providerRepository, isInitialized } = useRepositories()
  const { appointments, loading, error, loadAppointments, cancel, start, complete } =
    useAppointments()
  const [appointmentsWithDetails, setAppointmentsWithDetails] = useState<AppointmentWithDetails[]>(
    []
  )
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (isInitialized && currentUser) {
      loadAppointments()
    }
  }, [isInitialized, currentUser, loadAppointments])

  useEffect(() => {
    async function loadDetails() {
      const patientCache = new Map<string, Patient>()
      const providerCache = new Map<string, Provider>()

      const detailed = await Promise.all(
        appointments.map(async (apt) => {
          let patientName: string | undefined
          let providerName: string | undefined

          if (!patientCache.has(apt.patientId)) {
            const patient = await patientRepository.findById(apt.patientId)
            if (patient) patientCache.set(apt.patientId, patient)
          }
          const patient = patientCache.get(apt.patientId)
          patientName = patient?.fullName

          if (!providerCache.has(apt.providerId)) {
            const provider = await providerRepository.findById(apt.providerId)
            if (provider) providerCache.set(apt.providerId, provider)
          }
          const provider = providerCache.get(apt.providerId)
          providerName = provider?.fullName

          return Object.assign(apt, { patientName, providerName })
        })
      )

      setAppointmentsWithDetails(detailed)
    }

    if (appointments.length > 0) {
      loadDetails()
    } else {
      setAppointmentsWithDetails([])
    }
  }, [appointments, patientRepository, providerRepository])

  const handleCancel = async (appointmentId: string) => {
    setActionError(null)
    const success = await cancel(appointmentId)
    if (!success) {
      setActionError('Failed to cancel appointment')
    }
  }

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

  const canCancel = (apt: Appointment): boolean => {
    if (!currentUser) return false
    if (!apt.status.isScheduled()) return false
    if (currentUser.isPatient()) return apt.patientId === currentUser.entityId
    if (currentUser.isAdmin()) return true
    return false
  }

  const canStart = (apt: Appointment): boolean => {
    if (!currentUser) return false
    if (!currentUser.isProvider()) return false
    if (!apt.status.isScheduled()) return false
    return apt.providerId === currentUser.entityId
  }

  const canComplete = (apt: Appointment): boolean => {
    if (!currentUser) return false
    if (!currentUser.isProvider()) return false
    if (!apt.status.isInProgress()) return false
    return apt.providerId === currentUser.entityId
  }

  if (!currentUser) {
    return <div style={styles.message}>Please log in to view appointments.</div>
  }

  if (!isInitialized || currentUser || loading) {
    return <div style={styles.message}>Loading appointments...</div>
  }

  return (
    <div>
      <h2 style={styles.title}>Appointments</h2>

      <ErrorDisplay error={error} />

      {actionError && (
        <div style={styles.actionError}>
          {actionError}
          <button onClick={() => setActionError(null)} style={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      {appointmentsWithDetails.length === 0 ? (
        <div style={styles.empty}>No appointments found.</div>
      ) : (
        <div style={styles.list}>
          {appointmentsWithDetails.map((apt) => (
            <div key={apt.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span
                  style={{
                    ...styles.status,
                    backgroundColor: STATUS_COLORS[apt.status.value],
                  }}
                >
                  {STATUS_LABELS[apt.status.value]}
                </span>
                <span style={styles.time}>{apt.timeSlot.formatted()}</span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.row}>
                  <span style={styles.label}>Patient:</span>
                  <span>{apt.patientName ?? apt.patientId}</span>
                </div>
                <div style={styles.row}>
                  <span style={styles.label}>Provider:</span>
                  <span>{apt.providerName ?? apt.providerId}</span>
                </div>
                <div style={styles.row}>
                  <span style={styles.label}>Reason:</span>
                  <span>{apt.reason}</span>
                </div>
                {apt.notes && (
                  <div style={styles.row}>
                    <span style={styles.label}>Notes:</span>
                    <span>{apt.notes}</span>
                  </div>
                )}
              </div>

              <div style={styles.cardActions}>
                {canCancel(apt) && (
                  <button onClick={() => handleCancel(apt.id)} style={styles.cancelButton}>
                    Cancel
                  </button>
                )}
                {canStart(apt) && (
                  <button onClick={() => handleStart(apt.id)} style={styles.startButton}>
                    Start
                  </button>
                )}
                {canComplete(apt) && (
                  <button onClick={() => handleComplete(apt.id)} style={styles.completeButton}>
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  message: {
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
  },
  empty: {
    padding: '24px',
    textAlign: 'center',
    color: '#9ca3af',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#fff',
  },
  time: {
    fontSize: '14px',
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    gap: '8px',
    fontSize: '14px',
  },
  label: {
    fontWeight: 500,
    color: '#374151',
    minWidth: '80px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  cancelButton: {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  startButton: {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  completeButton: {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  actionError: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '4px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#92400e',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#92400e',
  },
}
