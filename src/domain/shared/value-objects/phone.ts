import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

export class Phone {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static create(value: string): Result<Phone, ValidationError> {
    const cleaned = value.replace(/\D/g, '')

    if (!cleaned) {
      return Result.fail(new ValidationError('phone', 'Phone number is required'))
    }

    if (cleaned.length < 10 || cleaned.length > 15) {
      return Result.fail(
        new ValidationError('phone', 'Phone number must be between 10 and 15 digits')
      )
    }

    return Result.ok(new Phone(cleaned))
  }

  equals(other: Phone): boolean {
    return this._value === other._value
  }

  formatted(): string {
    if (this._value.length === 11) {
      return `(${this._value.slice(0, 2)}) ${this._value.slice(2, 7)}-${this._value.slice(7)}`
    }
    if (this._value.length === 10) {
      return `(${this._value.slice(0, 2)}) ${this._value.slice(2, 6)}-${this._value.slice(6)}`
    }
    return this._value
  }

  toString(): string {
    return this._value
  }
}
