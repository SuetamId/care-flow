import { UniqueId } from '@shared/types'
import { Patient } from '../entities'

export interface PatientFilters {
  email?: string
  name?: string
}

export interface PatientRepository {
  findById(id: UniqueId): Promise<Patient | null>
  findByEmail(email: string): Promise<Patient | null>
  findAll(filters?: PatientFilters): Promise<Patient[]>
  save(patient: Patient): Promise<void>
  delete(id: UniqueId): Promise<void>
  exists(id: UniqueId): Promise<boolean>
}
