export const UserRoles = {
  PATIENT: 'patient',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const

export type UserRoleType = (typeof UserRoles)[keyof typeof UserRoles]

const rolePermissions: Record<UserRoleType, string[]> = {
  [UserRoles.PATIENT]: [
    'appointment:view_own',
    'appointment:create',
    'appointment:cancel_own',
    'patient:view_own',
    'patient:update_own',
  ],
  [UserRoles.PROVIDER]: [
    'appointment:view_own',
    'appointment:view_assigned',
    'appointment:start',
    'appointment:complete',
    'appointment:cancel_assigned',
    'patient:view_assigned',
    'provider:view_own',
    'provider:update_own',
  ],
  [UserRoles.ADMIN]: [
    'appointment:view_all',
    'appointment:create',
    'appointment:update_all',
    'appointment:delete',
    'patient:view_all',
    'patient:create',
    'patient:update_all',
    'patient:delete',
    'provider:view_all',
    'provider:create',
    'provider:update_all',
    'provider:delete',
    'clinic:view_all',
    'clinic:create',
    'clinic:update_all',
    'clinic:delete',
  ],
}

export class UserRole {
  private constructor(private readonly _value: UserRoleType) {}

  get value(): UserRoleType {
    return this._value
  }

  static patient(): UserRole {
    return new UserRole(UserRoles.PATIENT)
  }

  static provider(): UserRole {
    return new UserRole(UserRoles.PROVIDER)
  }

  static admin(): UserRole {
    return new UserRole(UserRoles.ADMIN)
  }

  static fromValue(value: UserRoleType): UserRole {
    return new UserRole(value)
  }

  isPatient(): boolean {
    return this._value === UserRoles.PATIENT
  }

  isProvider(): boolean {
    return this._value === UserRoles.PROVIDER
  }

  isAdmin(): boolean {
    return this._value === UserRoles.ADMIN
  }

  hasPermission(permission: string): boolean {
    return rolePermissions[this._value].includes(permission)
  }

  getPermissions(): string[] {
    return [...rolePermissions[this._value]]
  }

  equals(other: UserRole): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
