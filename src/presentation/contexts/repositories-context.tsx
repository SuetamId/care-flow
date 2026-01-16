import { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react'
import { createUniqueId } from '@shared/types'
import { AppointmentRepository } from '@domain/appointment'
import { PatientRepository } from '@domain/patient'
import { ProviderRepository } from '@domain/provider'
import {
  MockAppointmentRepository,
  MockPatientRepository,
  MockProviderRepository,
  createSeedPatients,
  createSeedProviders,
  createSeedAppointments,
} from '@infrastructure/repositories'

interface RepositoriesContextValue {
  appointmentRepository: AppointmentRepository
  patientRepository: PatientRepository
  providerRepository: ProviderRepository
  isInitialized: boolean
}

const RepositoriesContext = createContext<RepositoriesContextValue | null>(null)

const CLINIC_ID = createUniqueId('clinic-1')

interface RepositoriesProviderProps {
  children: ReactNode
}

export function RepositoriesProvider({ children }: RepositoriesProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  const repositories = useMemo(() => {
    const appointmentRepository = new MockAppointmentRepository()
    const patientRepository = new MockPatientRepository()
    const providerRepository = new MockProviderRepository()

    return { appointmentRepository, patientRepository, providerRepository }
  }, [])

  useEffect(() => {
    const patients = createSeedPatients()
    const providers = createSeedProviders(CLINIC_ID)

    ;(repositories.patientRepository as MockPatientRepository).seed(patients)
    ;(repositories.providerRepository as MockProviderRepository).seed(providers)

    const patientIds = patients.map((p) => p.id)
    const providerIds = providers.map((p) => p.id)
    const appointments = createSeedAppointments(patientIds, providerIds, CLINIC_ID)

    ;(repositories.appointmentRepository as MockAppointmentRepository).seed(appointments)

    setIsInitialized(true)
  }, [repositories])

  return (
    <RepositoriesContext.Provider value={{ ...repositories, isInitialized }}>
      {children}
    </RepositoriesContext.Provider>
  )
}

export function useRepositories(): RepositoriesContextValue {
  const context = useContext(RepositoriesContext)
  if (!context) {
    throw new Error('useRepositories must be used within a RepositoriesProvider')
  }
  return context
}

export function getClinicId() {
  return CLINIC_ID
}
