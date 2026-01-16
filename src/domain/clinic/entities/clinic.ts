import { UniqueId, generateUniqueId } from '@shared/types'
import { Email, Phone, Address } from '@domain/shared/value-objects'

interface OperatingHours {
  dayOfWeek: number
  openTime: string
  closeTime: string
}

interface ClinicProps {
  id: UniqueId
  name: string
  email: Email
  phone: Phone
  address: Address
  operatingHours: OperatingHours[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface CreateClinicProps {
  id?: UniqueId
  name: string
  email: Email
  phone: Phone
  address: Address
  operatingHours?: OperatingHours[]
}

export class Clinic {
  private constructor(private _props: ClinicProps) {}

  get id(): UniqueId {
    return this._props.id
  }

  get name(): string {
    return this._props.name
  }

  get email(): Email {
    return this._props.email
  }

  get phone(): Phone {
    return this._props.phone
  }

  get address(): Address {
    return this._props.address
  }

  get operatingHours(): OperatingHours[] {
    return [...this._props.operatingHours]
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

  static create(props: CreateClinicProps): Clinic {
    const now = new Date()

    const defaultOperatingHours: OperatingHours[] = [
      { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00' },
    ]

    return new Clinic({
      id: props.id ?? generateUniqueId(),
      name: props.name.trim(),
      email: props.email,
      phone: props.phone,
      address: props.address,
      operatingHours: props.operatingHours ?? defaultOperatingHours,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: ClinicProps): Clinic {
    return new Clinic(props)
  }

  isOpenOn(dayOfWeek: number): boolean {
    return this._props.operatingHours.some((h) => h.dayOfWeek === dayOfWeek)
  }

  getHoursFor(dayOfWeek: number): OperatingHours | undefined {
    return this._props.operatingHours.find((h) => h.dayOfWeek === dayOfWeek)
  }

  updateOperatingHours(hours: OperatingHours[]): void {
    this._props.operatingHours = hours
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
      name: this._props.name,
      email: this._props.email.value,
      phone: this._props.phone.value,
      address: {
        street: this._props.address.street,
        number: this._props.address.number,
        complement: this._props.address.complement,
        neighborhood: this._props.address.neighborhood,
        city: this._props.address.city,
        state: this._props.address.state,
        zipCode: this._props.address.zipCode,
        country: this._props.address.country,
      },
      operatingHours: this._props.operatingHours,
      isActive: this._props.isActive,
      createdAt: this._props.createdAt.toISOString(),
      updatedAt: this._props.updatedAt.toISOString(),
    }
  }
}
