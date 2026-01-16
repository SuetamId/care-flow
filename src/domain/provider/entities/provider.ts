import { UniqueId, generateUniqueId } from '@shared/types'
import { Email, Phone } from '@domain/shared/value-objects'
import { Specialty, LicenseNumber } from '../value-objects'

interface ProviderProps {
  id: UniqueId
  firstName: string
  lastName: string
  email: Email
  phone: Phone
  specialty: Specialty
  licenseNumber: LicenseNumber
  clinicId: UniqueId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface CreateProviderProps {
  id?: UniqueId
  firstName: string
  lastName: string
  email: Email
  phone: Phone
  specialty: Specialty
  licenseNumber: LicenseNumber
  clinicId: UniqueId
}

export class Provider {
  private constructor(private _props: ProviderProps) {}

  get id(): UniqueId {
    return this._props.id
  }

  get firstName(): string {
    return this._props.firstName
  }

  get lastName(): string {
    return this._props.lastName
  }

  get fullName(): string {
    return `Dr. ${this._props.firstName} ${this._props.lastName}`
  }

  get email(): Email {
    return this._props.email
  }

  get phone(): Phone {
    return this._props.phone
  }

  get specialty(): Specialty {
    return this._props.specialty
  }

  get licenseNumber(): LicenseNumber {
    return this._props.licenseNumber
  }

  get clinicId(): UniqueId {
    return this._props.clinicId
  }

  get isActive(): boolean {
    return this._props.isActive
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  get updatedAt(): Date {
    return this._props.updatedAt
  }

  static create(props: CreateProviderProps): Provider {
    const now = new Date()

    return new Provider({
      id: props.id ?? generateUniqueId(),
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      email: props.email,
      phone: props.phone,
      specialty: props.specialty,
      licenseNumber: props.licenseNumber,
      clinicId: props.clinicId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: ProviderProps): Provider {
    return new Provider(props)
  }

  updateContactInfo(email: Email, phone: Phone): void {
    this._props.email = email
    this._props.phone = phone
    this._props.updatedAt = new Date()
  }

  activate(): void {
    this._props.isActive = true
    this._props.updatedAt = new Date()
  }

  deactivate(): void {
    this._props.isActive = false
    this._props.updatedAt = new Date()
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._props.id,
      firstName: this._props.firstName,
      lastName: this._props.lastName,
      email: this._props.email.value,
      phone: this._props.phone.value,
      specialty: this._props.specialty.value,
      licenseNumber: this._props.licenseNumber.formatted(),
      clinicId: this._props.clinicId,
      isActive: this._props.isActive,
      createdAt: this._props.createdAt.toISOString(),
      updatedAt: this._props.updatedAt.toISOString(),
    }
  }
}
