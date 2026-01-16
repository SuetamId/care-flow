import { UniqueId } from '@shared/types'
import {
  Appointment,
  AppointmentRepository,
  AppointmentFilters,
  AppointmentStatus,
  TimeSlot,
} from '@domain/appointment'

const SIMULATED_DELAY_MS = 50

function delay(ms: number = SIMULATED_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockAppointmentRepository implements AppointmentRepository {
  private appointments: Map<UniqueId, Appointment> = new Map()

  async findById(id: UniqueId): Promise<Appointment | null> {
    await delay()
    return this.appointments.get(id) ?? null
  }

  async findByPatient(patientId: UniqueId): Promise<Appointment[]> {
    await delay()
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId
    )
  }

  async findByProvider(providerId: UniqueId): Promise<Appointment[]> {
    await delay()
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.providerId === providerId
    )
  }

  async findByProviderAndDateRange(
    providerId: UniqueId,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    await delay()
    return Array.from(this.appointments.values()).filter((appointment) => {
      if (appointment.providerId !== providerId) return false
      if (appointment.status.isCancelled()) return false

      const slotStart = appointment.timeSlot.startTime
      const slotEnd = appointment.timeSlot.endTime

      return slotStart < endDate && slotEnd > startDate
    })
  }

  async findAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    await delay()
    let results = Array.from(this.appointments.values())

    if (filters) {
      if (filters.patientId) {
        results = results.filter((a) => a.patientId === filters.patientId)
      }
      if (filters.providerId) {
        results = results.filter((a) => a.providerId === filters.providerId)
      }
      if (filters.clinicId) {
        results = results.filter((a) => a.clinicId === filters.clinicId)
      }
      if (filters.status) {
        results = results.filter((a) => a.status.value === filters.status)
      }
      if (filters.startDate) {
        results = results.filter((a) => a.timeSlot.startTime >= filters.startDate!)
      }
      if (filters.endDate) {
        results = results.filter((a) => a.timeSlot.endTime <= filters.endDate!)
      }
    }

    return results.sort((a, b) => a.timeSlot.startTime.getTime() - b.timeSlot.startTime.getTime())
  }

  async save(appointment: Appointment): Promise<void> {
    await delay()
    this.appointments.set(appointment.id, appointment)
  }

  async delete(id: UniqueId): Promise<void> {
    await delay()
    this.appointments.delete(id)
  }

  async exists(id: UniqueId): Promise<boolean> {
    await delay()
    return this.appointments.has(id)
  }

  seed(appointments: Appointment[]): void {
    appointments.forEach((appointment) => {
      this.appointments.set(appointment.id, appointment)
    })
  }

  clear(): void {
    this.appointments.clear()
  }
}

export function createSeedAppointments(
  patientIds: UniqueId[],
  providerIds: UniqueId[],
  clinicId: UniqueId
): Appointment[] {
  const now = new Date()
  const appointments: Appointment[] = []

  const timeSlot1 = TimeSlot.create(
    new Date(now.getTime() + 1 * 60 * 60 * 1000),
    new Date(now.getTime() + 2 * 60 * 60 * 1000)
  )

  const timeSlot2 = TimeSlot.create(
    new Date(now.getTime() + 3 * 60 * 60 * 1000),
    new Date(now.getTime() + 4 * 60 * 60 * 1000)
  )

  const timeSlot3 = TimeSlot.create(
    new Date(now.getTime() - 2 * 60 * 60 * 1000),
    new Date(now.getTime() - 1 * 60 * 60 * 1000)
  )

  if (timeSlot1.success && patientIds[0] && providerIds[0]) {
    appointments.push(
      Appointment.create({
        patientId: patientIds[0],
        providerId: providerIds[0],
        clinicId,
        timeSlot: timeSlot1.value,
        reason: 'Annual checkup',
      })
    )
  }

  if (timeSlot2.success && patientIds[1] && providerIds[0]) {
    appointments.push(
      Appointment.create({
        patientId: patientIds[1],
        providerId: providerIds[0],
        clinicId,
        timeSlot: timeSlot2.value,
        reason: 'Follow-up consultation',
      })
    )
  }

  if (timeSlot3.success && patientIds[0] && providerIds[1]) {
    const pastAppointment = Appointment.create({
      patientId: patientIds[0],
      providerId: providerIds[1],
      clinicId,
      timeSlot: timeSlot3.value,
      reason: 'Routine examination',
    })
    pastAppointment.startAppointment(providerIds[1])
    pastAppointment.completeAppointment(providerIds[1], 'Patient is in good health')
    appointments.push(pastAppointment)
  }

  return appointments
}
