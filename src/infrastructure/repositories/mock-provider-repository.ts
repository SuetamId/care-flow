import { UniqueId, createUniqueId } from '@shared/types'
import {
  Provider,
  ProviderRepository,
  ProviderFilters,
  MedicalSpecialtyType,
  Specialty,
  LicenseNumber,
} from '@domain/provider'
import { Email, Phone } from '@domain/shared'

const SIMULATED_DELAY_MS = 50

function delay(ms: number = SIMULATED_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockProviderRepository implements ProviderRepository {
  private providers: Map<UniqueId, Provider> = new Map()

  async findById(id: UniqueId): Promise<Provider | null> {
    await delay()
    return this.providers.get(id) ?? null
  }

  async findByEmail(email: string): Promise<Provider | null> {
    await delay()
    return (
      Array.from(this.providers.values()).find((provider) => provider.email.value === email) ?? null
    )
  }

  async findByClinic(clinicId: UniqueId): Promise<Provider[]> {
    await delay()
    return Array.from(this.providers.values()).filter((provider) => provider.clinicId === clinicId)
  }

  async findBySpecialty(specialty: MedicalSpecialtyType): Promise<Provider[]> {
    await delay()
    return Array.from(this.providers.values()).filter(
      (provider) => provider.specialty.value === specialty
    )
  }

  async findAll(filters?: ProviderFilters): Promise<Provider[]> {
    await delay()
    let results = Array.from(this.providers.values())

    if (filters) {
      if (filters.clinicId) {
        results = results.filter((p) => p.clinicId === filters.clinicId)
      }
      if (filters.specialty) {
        results = results.filter((p) => p.specialty.value === filters.specialty)
      }
      if (filters.isActive !== undefined) {
        results = results.filter((p) => p.isActive === filters.isActive)
      }
      if (filters.name) {
        const searchName = filters.name.toLowerCase()
        results = results.filter((p) => p.fullName.toLowerCase().includes(searchName))
      }
    }

    return results.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }

  async save(provider: Provider): Promise<void> {
    await delay()
    this.providers.set(provider.id, provider)
  }

  async delete(id: UniqueId): Promise<void> {
    await delay()
    this.providers.delete(id)
  }

  async exists(id: UniqueId): Promise<boolean> {
    await delay()
    return this.providers.has(id)
  }

  seed(providers: Provider[]): void {
    providers.forEach((provider) => {
      this.providers.set(provider.id, provider)
    })
  }

  clear(): void {
    this.providers.clear()
  }
}

export function createSeedProviders(clinicId: UniqueId): Provider[] {
  const providers: Provider[] = []

  const email1 = Email.create('dr.maria.santos@clinic.com')
  const phone1 = Phone.create('11999991111')
  const specialty1 = Specialty.create('general_practice')
  const license1 = LicenseNumber.create('123456', 'SP')

  if (email1.success && phone1.success && specialty1.success && license1.success) {
    providers.push(
      Provider.create({
        id: createUniqueId('provider-1'),
        firstName: 'Maria',
        lastName: 'Santos',
        email: email1.value,
        phone: phone1.value,
        specialty: specialty1.value,
        licenseNumber: license1.value,
        clinicId,
      })
    )
  }

  const email2 = Email.create('dr.carlos.oliveira@clinic.com')
  const phone2 = Phone.create('11999992222')
  const specialty2 = Specialty.create('cardiology')
  const license2 = LicenseNumber.create('654321', 'SP')

  if (email2.success && phone2.success && specialty2.success && license2.success) {
    providers.push(
      Provider.create({
        id: createUniqueId('provider-2'),
        firstName: 'Carlos',
        lastName: 'Oliveira',
        email: email2.value,
        phone: phone2.value,
        specialty: specialty2.value,
        licenseNumber: license2.value,
        clinicId,
      })
    )
  }

  return providers
}
