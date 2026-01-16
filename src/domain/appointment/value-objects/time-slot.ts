import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

export class TimeSlot {
  private constructor(
    private readonly _startTime: Date,
    private readonly _endTime: Date
  ) {}

  get startTime(): Date {
    return new Date(this._startTime)
  }

  get endTime(): Date {
    return new Date(this._endTime)
  }

  get durationInMinutes(): number {
    return Math.round((this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60))
  }

  static create(startTime: Date, endTime: Date): Result<TimeSlot, ValidationError> {
    if (isNaN(startTime.getTime())) {
      return Result.fail(new ValidationError('startTime', 'Invalid start time'))
    }

    if (isNaN(endTime.getTime())) {
      return Result.fail(new ValidationError('endTime', 'Invalid end time'))
    }

    if (startTime >= endTime) {
      return Result.fail(new ValidationError('timeSlot', 'Start time must be before end time'))
    }

    const minDuration = 15
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)

    if (durationInMinutes < minDuration) {
      return Result.fail(
        new ValidationError('timeSlot', `Appointment must be at least ${minDuration} minutes`)
      )
    }

    return Result.ok(new TimeSlot(startTime, endTime))
  }

  overlaps(other: TimeSlot): boolean {
    return this._startTime < other._endTime && this._endTime > other._startTime
  }

  contains(date: Date): boolean {
    return date >= this._startTime && date <= this._endTime
  }

  isBefore(other: TimeSlot): boolean {
    return this._endTime <= other._startTime
  }

  isAfter(other: TimeSlot): boolean {
    return this._startTime >= other._endTime
  }

  equals(other: TimeSlot): boolean {
    return (
      this._startTime.getTime() === other._startTime.getTime() &&
      this._endTime.getTime() === other._endTime.getTime()
    )
  }

  formatted(locale: string = 'pt-BR'): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    }

    const start = this._startTime.toLocaleTimeString(locale, options)
    const end = this._endTime.toLocaleTimeString(locale, options)

    return `${start} - ${end}`
  }

  toString(): string {
    return `${this._startTime.toISOString()} - ${this._endTime.toISOString()}`
  }
}
