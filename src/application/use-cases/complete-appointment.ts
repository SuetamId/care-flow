import { Result } from '@shared/types'
import { NotFoundError, AuthorizationError } from '@shared/errors'
import {
  AppointmentRepository,
  InvalidStatusTransitionError,
  ProviderRequiredError,
} from '@domain/appointment'
import { AuthenticatedUser } from '@domain/auth'

export interface CompleteAppointmentInput {
  appointmentId: string
  notes?: string
}

export interface CompleteAppointmentDeps {
  appointmentRepository: AppointmentRepository
}

type CompleteAppointmentError =
  | NotFoundError
  | AuthorizationError
  | InvalidStatusTransitionError
  | ProviderRequiredError

export async function completeAppointment(
  input: CompleteAppointmentInput,
  deps: CompleteAppointmentDeps,
  actor: AuthenticatedUser
): Promise<Result<void, CompleteAppointmentError>> {
  if (!actor.isProvider()) {
    return Result.fail(new AuthorizationError('Only providers can complete appointments'))
  }

  const appointment = await deps.appointmentRepository.findById(input.appointmentId)

  if (!appointment) {
    return Result.fail(new NotFoundError('Appointment', input.appointmentId))
  }

  if (actor.entityId !== appointment.providerId) {
    return Result.fail(new AuthorizationError('Providers can only complete their own appointments'))
  }

  const completeResult = appointment.completeAppointment(actor.entityId, input.notes)
  if (!completeResult.success) {
    return Result.fail(completeResult.error)
  }

  await deps.appointmentRepository.save(appointment)

  return Result.ok(undefined)
}
