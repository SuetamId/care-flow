import { UniqueId } from '@shared/types'
import { Email } from '@domain/shared/value-objects'
import { UserRole, UserRoleType } from '../value-objects'

interface AuthenticatedUserProps {
  id: UniqueId
  email: Email
  name: string
  role: UserRole
  entityId: UniqueId
}

export class AuthenticatedUser {
  private constructor(private readonly _props: AuthenticatedUserProps) {}

  get id(): UniqueId {
    return this._props.id
  }

  get email(): Email {
    return this._props.email
  }

  get name(): string {
    return this._props.name
  }

  get role(): UserRole {
    return this._props.role
  }

  get entityId(): UniqueId {
    return this._props.entityId
  }

  static create(props: {
    id: UniqueId
    email: Email
    name: string
    role: UserRoleType
    entityId: UniqueId
  }): AuthenticatedUser {
    return new AuthenticatedUser({
      id: props.id,
      email: props.email,
      name: props.name,
      role: UserRole.fromValue(props.role),
      entityId: props.entityId,
    })
  }

  isPatient(): boolean {
    return this._props.role.isPatient()
  }

  isProvider(): boolean {
    return this._props.role.isProvider()
  }

  isAdmin(): boolean {
    return this._props.role.isAdmin()
  }

  hasPermission(permission: string): boolean {
    return this._props.role.hasPermission(permission)
  }

  canAccessPatient(patientId: UniqueId): boolean {
    if (this.isAdmin()) {
      return true
    }

    if (this.isPatient()) {
      return this._props.entityId === patientId
    }

    return this.hasPermission('patient:view_assigned')
  }

  canAccessAppointment(appointmentPatientId: UniqueId, appointmentProviderId: UniqueId): boolean {
    if (this.isAdmin()) {
      return true
    }

    if (this.isPatient()) {
      return this._props.entityId === appointmentPatientId
    }

    if (this.isProvider()) {
      return this._props.entityId === appointmentProviderId
    }

    return false
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._props.id,
      email: this._props.email.value,
      name: this._props.name,
      role: this._props.role.value,
      entityId: this._props.entityId,
    }
  }
}
