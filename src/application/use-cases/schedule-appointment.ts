import { generateUniqueId, Result, UniqueId } from '@shared/types'
import { DomainError, ValidationError, NotFoundError, AuthorizationError } from '@shared/errors'
import { Appointment, AppointmentRepository, TimeSlot } from '@domain/appointment'
import { PatientRepository } from '@domain/patient'
import { ProviderRepository } from '@domain/provider'
import { AuthenticatedUser } from '@domain/auth'

export class AppointmentConflictError extends DomainError {
  readonly code = 'APPOINTMENT_CONFLICT'

  constructor() {
    super('Provider already has an appointment scheduled for this time slot')
  }
}

export interface ScheduleAppointmentInput {
  patientId: string
  providerId: string
  clinicId: string
  startTime: Date
  endTime: Date
  reason: string
}

export interface ScheduleAppointmentDeps {
  appointmentRepository: AppointmentRepository
  patientRepository: PatientRepository
  providerRepository: ProviderRepository
}

type ScheduleAppointmentError =
  | ValidationError
  | NotFoundError
  | AuthorizationError
  | AppointmentConflictError

export async function scheduleAppointment(
  input: ScheduleAppointmentInput,
  deps: ScheduleAppointmentDeps,
  actor: AuthenticatedUser
): Promise<Result<Appointment, ScheduleAppointmentError>> {
  if (!actor.isAdmin() && !actor.isPatient()) {
    return Result.fail(new AuthorizationError('Only patients or admins can schedule appointments'))
  }

  if (actor.isPatient() && actor.entityId !== input.patientId) {
    return Result.fail(new AuthorizationError('Patients can only schedule appointments for themselves'))
  }

  const timeSlotResult = TimeSlot.create(input.startTime, input.endTime)
  if (!timeSlotResult.success) {
    return Result.fail(timeSlotResult.error)
  }

  const patient = await deps.patientRepository.findById(input.patientId as UniqueId)
  if (!patient) {
    return Result.fail(new NotFoundError('Patient', input.patientId))
  }

  const provider = await deps.providerRepository.findById(input.providerId as UniqueId)
  if (!provider) {
    return Result.fail(new NotFoundError('Provider', input.providerId))
  }

  if (!provider.isActive) {
    return Result.fail(new ValidationError('provider', 'Provider is not active'))
  }

  const existingAppointments = await deps.appointmentRepository.findByProviderAndDateRange(
    input.providerId as UniqueId,
    input.startTime,
    input.endTime
  )

  const appointment = Appointment.create({
    patientId: input.patientId as UniqueId,
    providerId: input.providerId as UniqueId,
    clinicId: (input.clinicId as UniqueId) ?? generateUniqueId(),
    timeSlot: timeSlotResult.value,
    reason: input.reason,
  })

  const hasConflict = existingAppointments.some((existing) => appointment.overlaps(existing))
  if (hasConflict) {
    return Result.fail(new AppointmentConflictError())
  }

  await deps.appointmentRepository.save(appointment)

  return Result.ok(appointment)
}
