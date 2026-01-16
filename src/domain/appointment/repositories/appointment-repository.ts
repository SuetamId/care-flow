import { UniqueId } from '@shared/types'
import { Appointment } from '../entities'
import { AppointmentStatusType } from '../value-objects'

export interface AppointmentFilters {
  patientId?: UniqueId
  providerId?: UniqueId
  clinicId?: UniqueId
  status?: AppointmentStatusType
  startDate?: Date
  endDate?: Date
}

export interface AppointmentRepository {
  findById(id: UniqueId): Promise<Appointment | null>
  findByPatient(patientId: UniqueId): Promise<Appointment[]>
  findByProvider(providerId: UniqueId): Promise<Appointment[]>
  findByProviderAndDateRange(
    providerId: UniqueId,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]>
  findAll(filters?: AppointmentFilters): Promise<Appointment[]>
  save(appointment: Appointment): Promise<void>
  delete(id: UniqueId): Promise<void>
  exists(id: UniqueId): Promise<boolean>
}
