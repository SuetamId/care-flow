import { UniqueId } from '@shared/types'
import { Clinic } from '../entities'

export interface ClinicFilters {
  city?: string
  isActive?: boolean
  name?: string
}

export interface ClinicRepository {
  findById(id: UniqueId): Promise<Clinic | null>
  findAll(filters?: ClinicFilters): Promise<Clinic[]>
  save(clinic: Clinic): Promise<void>
  delete(id: UniqueId): Promise<void>
  exists(id: UniqueId): Promise<boolean>
}
