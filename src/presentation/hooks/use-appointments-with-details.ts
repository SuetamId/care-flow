import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@domain/appointment'
import { Patient } from '@domain/patient'
import { Provider } from '@domain/provider'
import { useRepositories } from '../contexts/repositories-context'
import { useAppointments } from './use-appointments'

export interface AppointmentWithDetails extends Appointment {
  patientName?: string
  providerName?: string
}

interface UseAppointmentsWithDetailsResult {
  appointments: AppointmentWithDetails[]
  loading: boolean
  error: ReturnType<typeof useAppointments>['error']
  loadAppointments: () => Promise<void>
  cancel: (appointmentId: string) => Promise<boolean>
  start: (appointmentId: string) => Promise<boolean>
  complete: (appointmentId: string, notes?: string) => Promise<boolean>
}

export function useAppointmentsWithDetails(): UseAppointmentsWithDetailsResult {
  const { patientRepository, providerRepository, isInitialized } = useRepositories()
  const {
    appointments: rawAppointments,
    loading: appointmentsLoading,
    error,
    loadAppointments: loadRawAppointments,
    cancel,
    start,
    complete,
  } = useAppointments()

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  const loadAppointments = useCallback(async () => {
    await loadRawAppointments()
  }, [loadRawAppointments])

  useEffect(() => {
    async function enrichWithDetails() {
      if (rawAppointments.length === 0) {
        setAppointments([])
        return
      }

      setDetailsLoading(true)

      try {
        const patientCache = new Map<string, Patient>()
        const providerCache = new Map<string, Provider>()

        const enriched = await Promise.all(
          rawAppointments.map(async (apt) => {
            let patientName: string | undefined
            let providerName: string | undefined

            if (!patientCache.has(apt.patientId)) {
              const patient = await patientRepository.findById(apt.patientId)
              if (patient) patientCache.set(apt.patientId, patient)
            }
            patientName = patientCache.get(apt.patientId)?.fullName

            if (!providerCache.has(apt.providerId)) {
              const provider = await providerRepository.findById(apt.providerId)
              if (provider) providerCache.set(apt.providerId, provider)
            }
            providerName = providerCache.get(apt.providerId)?.fullName

            return Object.assign(Object.create(Object.getPrototypeOf(apt)), apt, {
              patientName,
              providerName,
            }) as AppointmentWithDetails
          })
        )

        setAppointments(enriched)
      } finally {
        setDetailsLoading(false)
      }
    }

    if (isInitialized) {
      enrichWithDetails()
    }
  }, [rawAppointments, patientRepository, providerRepository, isInitialized])

  return {
    appointments,
    loading: appointmentsLoading || detailsLoading,
    error,
    loadAppointments,
    cancel,
    start,
    complete,
  }
}
