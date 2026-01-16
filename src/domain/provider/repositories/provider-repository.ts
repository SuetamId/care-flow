import { UniqueId } from '@shared/types'
import { Provider } from '../entities'
import { MedicalSpecialtyType } from '../value-objects'

export interface ProviderFilters {
  clinicId?: UniqueId
  specialty?: MedicalSpecialtyType
  isActive?: boolean
  name?: string
}

export interface ProviderRepository {
  findById(id: UniqueId): Promise<Provider | null>
  findByEmail(email: string): Promise<Provider | null>
  findByClinic(clinicId: UniqueId): Promise<Provider[]>
  findBySpecialty(specialty: MedicalSpecialtyType): Promise<Provider[]>
  findAll(filters?: ProviderFilters): Promise<Provider[]>
  save(provider: Provider): Promise<void>
  delete(id: UniqueId): Promise<void>
  exists(id: UniqueId): Promise<boolean>
}
