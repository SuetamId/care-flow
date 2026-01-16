import { Result } from '@shared/types'
import { NotFoundError, AuthorizationError } from '@shared/errors'
import {
  AppointmentRepository,
  InvalidStatusTransitionError,
  ProviderRequiredError,
} from '@domain/appointment'
import { AuthenticatedUser } from '@domain/auth'

export interface StartAppointmentInput {
  appointmentId: string
}

export interface StartAppointmentDeps {
  appointmentRepository: AppointmentRepository
}

type StartAppointmentError =
  | NotFoundError
  | AuthorizationError
  | InvalidStatusTransitionError
  | ProviderRequiredError

export async function startAppointment(
  input: StartAppointmentInput,
  deps: StartAppointmentDeps,
  actor: AuthenticatedUser
): Promise<Result<void, StartAppointmentError>> {
  if (!actor.isProvider()) {
    return Result.fail(new AuthorizationError('Only providers can start appointments'))
  }

  const appointment = await deps.appointmentRepository.findById(input.appointmentId)

  if (!appointment) {
    return Result.fail(new NotFoundError('Appointment', input.appointmentId))
  }

  if (actor.entityId !== appointment.providerId) {
    return Result.fail(new AuthorizationError('Providers can only start their own appointments'))
  }

  const startResult = appointment.startAppointment(actor.entityId)
  if (!startResult.success) {
    return Result.fail(startResult.error)
  }

  await deps.appointmentRepository.save(appointment)

  return Result.ok(undefined)
}
