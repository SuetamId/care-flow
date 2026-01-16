export const AppointmentStatusValues = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type AppointmentStatusType =
  (typeof AppointmentStatusValues)[keyof typeof AppointmentStatusValues]

export class AppointmentStatus {
  private constructor(private readonly _value: AppointmentStatusType) {}

  get value(): AppointmentStatusType {
    return this._value
  }

  static scheduled(): AppointmentStatus {
    return new AppointmentStatus(AppointmentStatusValues.SCHEDULED)
  }

  static inProgress(): AppointmentStatus {
    return new AppointmentStatus(AppointmentStatusValues.IN_PROGRESS)
  }

  static completed(): AppointmentStatus {
    return new AppointmentStatus(AppointmentStatusValues.COMPLETED)
  }

  static cancelled(): AppointmentStatus {
    return new AppointmentStatus(AppointmentStatusValues.CANCELLED)
  }

  static fromValue(value: AppointmentStatusType): AppointmentStatus {
    return new AppointmentStatus(value)
  }

  isScheduled(): boolean {
    return this._value === AppointmentStatusValues.SCHEDULED
  }

  isInProgress(): boolean {
    return this._value === AppointmentStatusValues.IN_PROGRESS
  }

  isCompleted(): boolean {
    return this._value === AppointmentStatusValues.COMPLETED
  }

  isCancelled(): boolean {
    return this._value === AppointmentStatusValues.CANCELLED
  }

  canTransitionTo(target: AppointmentStatus): boolean {
    const transitions: Record<AppointmentStatusType, AppointmentStatusType[]> = {
      [AppointmentStatusValues.SCHEDULED]: [
        AppointmentStatusValues.IN_PROGRESS,
        AppointmentStatusValues.CANCELLED,
      ],
      [AppointmentStatusValues.IN_PROGRESS]: [
        AppointmentStatusValues.COMPLETED,
        AppointmentStatusValues.CANCELLED,
      ],
      [AppointmentStatusValues.COMPLETED]: [],
      [AppointmentStatusValues.CANCELLED]: [],
    }

    return transitions[this._value].includes(target.value)
  }

  equals(other: AppointmentStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
