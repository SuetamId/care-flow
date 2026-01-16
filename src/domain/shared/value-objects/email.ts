import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

export class Email {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static create(value: string): Result<Email, ValidationError> {
    const trimmed = value.trim().toLowerCase()

    if (!trimmed) {
      return Result.fail(new ValidationError('email', 'Email is required'))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return Result.fail(new ValidationError('email', 'Invalid email format'))
    }

    return Result.ok(new Email(trimmed))
  }

  equals(other: Email): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
