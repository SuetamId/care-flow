import { UniqueId, generateUniqueId, Result } from '@shared/types'
import { DomainError } from '@shared/errors'
import { AppointmentStatus, TimeSlot } from '../value-objects'

export class InvalidStatusTransitionError extends DomainError {
  readonly code = 'INVALID_STATUS_TRANSITION'

  constructor(from: string, to: string) {
    super(`Cannot transition appointment from "${from}" to "${to}"`)
  }
}

export class ProviderRequiredError extends DomainError {
  readonly code = 'PROVIDER_REQUIRED'

  constructor() {
    super('Only providers can update clinical status')
  }
}

interface AppointmentProps {
  id: UniqueId
  patientId: UniqueId
  providerId: UniqueId
  clinicId: UniqueId
  timeSlot: TimeSlot
  status: AppointmentStatus
  reason: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface CreateAppointmentProps {
  id?: UniqueId
  patientId: UniqueId
  providerId: UniqueId
  clinicId: UniqueId
  timeSlot: TimeSlot
  reason: string
}

export class Appointment {
  private constructor(private _props: AppointmentProps) {}

  get id(): UniqueId {
    return this._props.id
  }

  get patientId(): UniqueId {
    return this._props.patientId
  }

  get providerId(): UniqueId {
    return this._props.providerId
  }

  get clinicId(): UniqueId {
    return this._props.clinicId
  }

  get timeSlot(): TimeSlot {
    return this._props.timeSlot
  }

  get status(): AppointmentStatus {
    return this._props.status
  }

  get reason(): string {
    return this._props.reason
  }

  get notes(): string | undefined {
    return this._props.notes
  }

  get createdAt(): Date {
    return this._props.createdAt
  }

  get updatedAt(): Date {
    return this._props.updatedAt
  }

  static create(props: CreateAppointmentProps): Appointment {
    const now = new Date()

    return new Appointment({
      id: props.id ?? generateUniqueId(),
      patientId: props.patientId,
      providerId: props.providerId,
      clinicId: props.clinicId,
      timeSlot: props.timeSlot,
      status: AppointmentStatus.scheduled(),
      reason: props.reason.trim(),
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: AppointmentProps): Appointment {
    return new Appointment(props)
  }

  overlaps(other: Appointment): boolean {
    if (this._props.providerId !== other._props.providerId) {
      return false
    }

    if (this._props.status.isCancelled() || other._props.status.isCancelled()) {
      return false
    }

    return this._props.timeSlot.overlaps(other._props.timeSlot)
  }

  startAppointment(
    actorProviderId: UniqueId
  ): Result<void, InvalidStatusTransitionError | ProviderRequiredError> {
    if (actorProviderId !== this._props.providerId) {
      return Result.fail(new ProviderRequiredError())
    }

    const newStatus = AppointmentStatus.inProgress()

    if (!this._props.status.canTransitionTo(newStatus)) {
      return Result.fail(
        new InvalidStatusTransitionError(this._props.status.value, newStatus.value)
      )
    }

    this._props.status = newStatus
    this._props.updatedAt = new Date()

    return Result.ok(undefined)
  }

  completeAppointment(
    actorProviderId: UniqueId,
    notes?: string
  ): Result<void, InvalidStatusTransitionError | ProviderRequiredError> {
    if (actorProviderId !== this._props.providerId) {
      return Result.fail(new ProviderRequiredError())
    }

    const newStatus = AppointmentStatus.completed()

    if (!this._props.status.canTransitionTo(newStatus)) {
      return Result.fail(
        new InvalidStatusTransitionError(this._props.status.value, newStatus.value)
      )
    }

    this._props.status = newStatus
    if (notes) {
      this._props.notes = notes.trim()
    }
    this._props.updatedAt = new Date()

    return Result.ok(undefined)
  }

  cancel(): Result<void, InvalidStatusTransitionError> {
    const newStatus = AppointmentStatus.cancelled()

    if (!this._props.status.canTransitionTo(newStatus)) {
      return Result.fail(
        new InvalidStatusTransitionError(this._props.status.value, newStatus.value)
      )
    }

    this._props.status = newStatus
    this._props.updatedAt = new Date()

    return Result.ok(undefined)
  }

  reschedule(newTimeSlot: TimeSlot): Result<void, InvalidStatusTransitionError> {
    if (!this._props.status.isScheduled()) {
      return Result.fail(
        new InvalidStatusTransitionError(
          this._props.status.value,
          'Only scheduled appointments can be rescheduled'
        )
      )
    }

    this._props.timeSlot = newTimeSlot
    this._props.updatedAt = new Date()

    return Result.ok(undefined)
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._props.id,
      patientId: this._props.patientId,
      providerId: this._props.providerId,
      clinicId: this._props.clinicId,
      timeSlot: {
        startTime: this._props.timeSlot.startTime.toISOString(),
        endTime: this._props.timeSlot.endTime.toISOString(),
      },
      status: this._props.status.value,
      reason: this._props.reason,
      notes: this._props.notes,
      createdAt: this._props.createdAt.toISOString(),
      updatedAt: this._props.updatedAt.toISOString(),
    }
  }
}
