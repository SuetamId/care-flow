import { useState, useCallback } from 'react'
import { Appointment } from '@domain/appointment'
import { DomainError } from '@shared/errors'
import {
  scheduleAppointment,
  ScheduleAppointmentInput,
  cancelAppointment,
  startAppointment,
  completeAppointment,
  getAppointmentsByRole,
} from '@application/use-cases'
import { useAuth } from '../contexts/auth-context'
import { useRepositories, getClinicId } from '../contexts/repositories-context'

interface UseAppointmentsResult {
  appointments: Appointment[]
  loading: boolean
  error: DomainError | null
  loadAppointments: () => Promise<void>
  schedule: (input: Omit<ScheduleAppointmentInput, 'clinicId'>) => Promise<boolean>
  cancel: (appointmentId: string) => Promise<boolean>
  start: (appointmentId: string) => Promise<boolean>
  complete: (appointmentId: string, notes?: string) => Promise<boolean>
}

export function useAppointments(): UseAppointmentsResult {
  const { currentUser } = useAuth()
  const { appointmentRepository, patientRepository, providerRepository } = useRepositories()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<DomainError | null>(null)

  const loadAppointments = useCallback(async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)

    try {
      const result = await getAppointmentsByRole({ appointmentRepository }, currentUser)
      if (result.success) {
        setAppointments(result.value)
      }
    } finally {
      setLoading(false)
    }
  }, [currentUser, appointmentRepository])

  const schedule = useCallback(
    async (input: Omit<ScheduleAppointmentInput, 'clinicId'>): Promise<boolean> => {
      if (!currentUser) return false

      setLoading(true)
      setError(null)

      try {
        const result = await scheduleAppointment(
          { ...input, clinicId: getClinicId() },
          { appointmentRepository, patientRepository, providerRepository },
          currentUser
        )

        if (result.success) {
          await loadAppointments()
          return true
        } else {
          setError(result.error)
          return false
        }
      } finally {
        setLoading(false)
      }
    },
    [currentUser, appointmentRepository, patientRepository, providerRepository, loadAppointments]
  )

  const cancel = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      if (!currentUser) return false

      setLoading(true)
      setError(null)

      try {
        const result = await cancelAppointment({ appointmentId }, { appointmentRepository }, currentUser)

        if (result.success) {
          await loadAppointments()
          return true
        } else {
          setError(result.error)
          return false
        }
      } finally {
        setLoading(false)
      }
    },
    [currentUser, appointmentRepository, loadAppointments]
  )

  const start = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      if (!currentUser) return false

      setLoading(true)
      setError(null)

      try {
        const result = await startAppointment({ appointmentId }, { appointmentRepository }, currentUser)

        if (result.success) {
          await loadAppointments()
          return true
        } else {
          setError(result.error)
          return false
        }
      } finally {
        setLoading(false)
      }
    },
    [currentUser, appointmentRepository, loadAppointments]
  )

  const complete = useCallback(
    async (appointmentId: string, notes?: string): Promise<boolean> => {
      if (!currentUser) return false

      setLoading(true)
      setError(null)

      try {
        const result = await completeAppointment(
          { appointmentId, notes },
          { appointmentRepository },
          currentUser
        )

        if (result.success) {
          await loadAppointments()
          return true
        } else {
          setError(result.error)
          return false
        }
      } finally {
        setLoading(false)
      }
    },
    [currentUser, appointmentRepository, loadAppointments]
  )

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    schedule,
    cancel,
    start,
    complete,
  }
}
