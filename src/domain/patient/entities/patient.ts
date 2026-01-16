import { UniqueId, generateUniqueId } from '@shared/types'
import { Email, Phone, DateOfBirth, Address } from '@domain/shared/value-objects'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

interface PatientProps {
  id: UniqueId
  firstName: string
  lastName: string
  email: Email
  phone: Phone
  dateOfBirth: DateOfBirth
  gender: Gender
  address?: Address
  emergencyContact?: {
    name: string
    phone: Phone
    relationship: string
  }
  createdAt: Date
  updatedAt: Date
}

interface CreatePatientProps {
  id?: UniqueId
  firstName: string
  lastName: string
  email: Email
  phone: Phone
  dateOfBirth: DateOfBirth
  gender: Gender
  address?: Address
  emergencyContact?: {
    name: string
    phone: Phone
    relationship: string
  }
}

export class Patient {
  private constructor(private _props: PatientProps) {}

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
    return `${this._props.firstName} ${this._props.lastName}`
  }

  get email(): Email {
    return this._props.email
  }

  get phone(): Phone {
    return this._props.phone
  }

  get dateOfBirth(): DateOfBirth {
    return this._props.dateOfBirth
  }

  get age(): number {
    return this._props.dateOfBirth.getAge()
  }

  get gender(): Gender {
    return this._props.gender
  }

  get address(): Address | undefined {
    return this._props.address
  }

  get emergencyContact():
    | { name: string; phone: Phone; relationship: string }
    | undefined {
    return this._props.emergencyContact
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  get updatedAt(): Date {
    return this._props.updatedAt
  }

  static create(props: CreatePatientProps): Patient {
    const now = new Date()

    return new Patient({
      id: props.id ?? generateUniqueId(),
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      email: props.email,
      phone: props.phone,
      dateOfBirth: props.dateOfBirth,
      gender: props.gender,
      address: props.address,
      emergencyContact: props.emergencyContact,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: PatientProps): Patient {
    return new Patient(props)
  }

  updateContactInfo(email: Email, phone: Phone): void {
    this._props.email = email
    this._props.phone = phone
    this._props.updatedAt = new Date()
  }

  updateAddress(address: Address): void {
    this._props.address = address
    this._props.updatedAt = new Date()
  }

  updateEmergencyContact(contact: { name: string; phone: Phone; relationship: string }): void {
    this._props.emergencyContact = contact
    this._props.updatedAt = new Date()
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._props.id,
      firstName: this._props.firstName,
      lastName: this._props.lastName,
      email: this._props.email.value,
      phone: this._props.phone.value,
      dateOfBirth: this._props.dateOfBirth.toString(),
      gender: this._props.gender,
      address: this._props.address
        ? {
            street: this._props.address.street,
            number: this._props.address.number,
            complement: this._props.address.complement,
            neighborhood: this._props.address.neighborhood,
            city: this._props.address.city,
            state: this._props.address.state,
            zipCode: this._props.address.zipCode,
            country: this._props.address.country,
          }
        : undefined,
      emergencyContact: this._props.emergencyContact
        ? {
            name: this._props.emergencyContact.name,
            phone: this._props.emergencyContact.phone.value,
            relationship: this._props.emergencyContact.relationship,
          }
        : undefined,
      createdAt: this._props.createdAt.toISOString(),
      updatedAt: this._props.updatedAt.toISOString(),
    }
  }
}
