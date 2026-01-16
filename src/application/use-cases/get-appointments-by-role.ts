import { Result } from '@shared/types'
import { Appointment, AppointmentRepository } from '@domain/appointment'
import { AuthenticatedUser } from '@domain/auth'

export interface GetAppointmentsByRoleDeps {
  appointmentRepository: AppointmentRepository
}

export async function getAppointmentsByRole(
  deps: GetAppointmentsByRoleDeps,
  actor: AuthenticatedUser
): Promise<Result<Appointment[], never>> {
  let appointments: Appointment[]

  if (actor.isAdmin()) {
    appointments = await deps.appointmentRepository.findAll()
  } else if (actor.isProvider()) {
    appointments = await deps.appointmentRepository.findByProvider(actor.entityId)
  } else {
    appointments = await deps.appointmentRepository.findByPatient(actor.entityId)
  }

  return Result.ok(appointments)
}
