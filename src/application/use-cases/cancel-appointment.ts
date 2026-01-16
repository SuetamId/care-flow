import { Result } from '@shared/types'
import { NotFoundError, AuthorizationError } from '@shared/errors'
import { AppointmentRepository, InvalidStatusTransitionError } from '@domain/appointment'
import { AuthenticatedUser } from '@domain/auth'

export interface CancelAppointmentInput {
  appointmentId: string
}

export interface CancelAppointmentDeps {
  appointmentRepository: AppointmentRepository
}

type CancelAppointmentError = NotFoundError | AuthorizationError | InvalidStatusTransitionError

export async function cancelAppointment(
  input: CancelAppointmentInput,
  deps: CancelAppointmentDeps,
  actor: AuthenticatedUser
): Promise<Result<void, CancelAppointmentError>> {
  const appointment = await deps.appointmentRepository.findById(input.appointmentId)

  if (!appointment) {
    return Result.fail(new NotFoundError('Appointment', input.appointmentId))
  }

  if (actor.isPatient()) {
    if (actor.entityId !== appointment.patientId) {
      return Result.fail(new AuthorizationError('Patients can only cancel their own appointments'))
    }
  } else if (!actor.isAdmin()) {
    return Result.fail(new AuthorizationError('Only patients or admins can cancel appointments'))
  }

  const cancelResult = appointment.cancel()
  if (!cancelResult.success) {
    return Result.fail(cancelResult.error)
  }

  await deps.appointmentRepository.save(appointment)

  return Result.ok(undefined)
}
