import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

export class DateOfBirth {
  private constructor(private readonly _value: Date) {}

  get value(): Date {
    return new Date(this._value)
  }

  static create(value: Date | string): Result<DateOfBirth, ValidationError> {
    const date = typeof value === 'string' ? new Date(value) : value

    if (isNaN(date.getTime())) {
      return Result.fail(new ValidationError('dateOfBirth', 'Invalid date format'))
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date >= today) {
      return Result.fail(new ValidationError('dateOfBirth', 'Date of birth must be in the past'))
    }

    const maxAge = new Date()
    maxAge.setFullYear(maxAge.getFullYear() - 150)

    if (date < maxAge) {
      return Result.fail(new ValidationError('dateOfBirth', 'Invalid date of birth'))
    }

    return Result.ok(new DateOfBirth(date))
  }

  getAge(): number {
    const today = new Date()
    let age = today.getFullYear() - this._value.getFullYear()
    const monthDiff = today.getMonth() - this._value.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this._value.getDate())) {
      age--
    }

    return age
  }

  formatted(locale: string = 'pt-BR'): string {
    return this._value.toLocaleDateString(locale)
  }

  equals(other: DateOfBirth): boolean {
    return this._value.getTime() === other._value.getTime()
  }

  toString(): string {
    return this._value.toISOString().split('T')[0]
  }
}
