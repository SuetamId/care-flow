import { UniqueId, createUniqueId } from '@shared/types'
import { Patient, PatientRepository, PatientFilters } from '@domain/patient'
import { Email, Phone, DateOfBirth } from '@domain/shared'

const SIMULATED_DELAY_MS = 50

function delay(ms: number = SIMULATED_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockPatientRepository implements PatientRepository {
  private patients: Map<UniqueId, Patient> = new Map()

  async findById(id: UniqueId): Promise<Patient | null> {
    await delay()
    return this.patients.get(id) ?? null
  }

  async findByEmail(email: string): Promise<Patient | null> {
    await delay()
    return (
      Array.from(this.patients.values()).find((patient) => patient.email.value === email) ?? null
    )
  }

  async findAll(filters?: PatientFilters): Promise<Patient[]> {
    await delay()
    let results = Array.from(this.patients.values())

    if (filters) {
      if (filters.email) {
        results = results.filter((p) =>
          p.email.value.toLowerCase().includes(filters.email!.toLowerCase())
        )
      }
      if (filters.name) {
        const searchName = filters.name.toLowerCase()
        results = results.filter((p) => p.fullName.toLowerCase().includes(searchName))
      }
    }

    return results.sort((a, b) => a.fullName.localeCompare(b.fullName))
  }

  async save(patient: Patient): Promise<void> {
    await delay()
    this.patients.set(patient.id, patient)
  }

  async delete(id: UniqueId): Promise<void> {
    await delay()
    this.patients.delete(id)
  }

  async exists(id: UniqueId): Promise<boolean> {
    await delay()
    return this.patients.has(id)
  }

  seed(patients: Patient[]): void {
    patients.forEach((patient) => {
      this.patients.set(patient.id, patient)
    })
  }

  clear(): void {
    this.patients.clear()
  }
}

export function createSeedPatients(): Patient[] {
  const patients: Patient[] = []

  const email1 = Email.create('john.doe@email.com')
  const phone1 = Phone.create('11999998888')
  const dob1 = DateOfBirth.create('1985-03-15')

  if (email1.success && phone1.success && dob1.success) {
    patients.push(
      Patient.create({
        id: createUniqueId('patient-1'),
        firstName: 'John',
        lastName: 'Doe',
        email: email1.value,
        phone: phone1.value,
        dateOfBirth: dob1.value,
        gender: 'male',
      })
    )
  }

  const email2 = Email.create('jane.smith@email.com')
  const phone2 = Phone.create('11988887777')
  const dob2 = DateOfBirth.create('1990-07-22')

  if (email2.success && phone2.success && dob2.success) {
    patients.push(
      Patient.create({
        id: createUniqueId('patient-2'),
        firstName: 'Jane',
        lastName: 'Smith',
        email: email2.value,
        phone: phone2.value,
        dateOfBirth: dob2.value,
        gender: 'female',
      })
    )
  }

  const email3 = Email.create('bob.wilson@email.com')
  const phone3 = Phone.create('11977776666')
  const dob3 = DateOfBirth.create('1978-11-08')

  if (email3.success && phone3.success && dob3.success) {
    patients.push(
      Patient.create({
        id: createUniqueId('patient-3'),
        firstName: 'Bob',
        lastName: 'Wilson',
        email: email3.value,
        phone: phone3.value,
        dateOfBirth: dob3.value,
        gender: 'male',
      })
    )
  }

  return patients
}
