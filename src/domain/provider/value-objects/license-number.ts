import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

export class LicenseNumber {
  private constructor(
    private readonly _number: string,
    private readonly _state: string
  ) {}

  get number(): string {
    return this._number
  }

  get state(): string {
    return this._state
  }

  static create(number: string, state: string): Result<LicenseNumber, ValidationError> {
    const cleanNumber = number.trim()
    const cleanState = state.trim().toUpperCase()

    if (!cleanNumber) {
      return Result.fail(new ValidationError('licenseNumber', 'License number is required'))
    }

    if (cleanNumber.length < 4 || cleanNumber.length > 10) {
      return Result.fail(
        new ValidationError('licenseNumber', 'License number must be between 4 and 10 characters')
      )
    }

    if (!cleanState) {
      return Result.fail(new ValidationError('licenseState', 'License state is required'))
    }

    if (cleanState.length !== 2) {
      return Result.fail(
        new ValidationError('licenseState', 'License state must be a 2-letter code')
      )
    }

    return Result.ok(new LicenseNumber(cleanNumber, cleanState))
  }

  formatted(): string {
    return `CRM/${this._state} ${this._number}`
  }

  equals(other: LicenseNumber): boolean {
    return this._number === other._number && this._state === other._state
  }

  toString(): string {
    return this.formatted()
  }
}
