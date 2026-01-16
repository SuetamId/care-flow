import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

export const MedicalSpecialties = {
  GENERAL_PRACTICE: 'general_practice',
  CARDIOLOGY: 'cardiology',
  DERMATOLOGY: 'dermatology',
  ENDOCRINOLOGY: 'endocrinology',
  GASTROENTEROLOGY: 'gastroenterology',
  GYNECOLOGY: 'gynecology',
  NEUROLOGY: 'neurology',
  OPHTHALMOLOGY: 'ophthalmology',
  ORTHOPEDICS: 'orthopedics',
  PEDIATRICS: 'pediatrics',
  PSYCHIATRY: 'psychiatry',
  UROLOGY: 'urology',
} as const

export type MedicalSpecialtyType = (typeof MedicalSpecialties)[keyof typeof MedicalSpecialties]

const specialtyLabels: Record<MedicalSpecialtyType, string> = {
  [MedicalSpecialties.GENERAL_PRACTICE]: 'General Practice',
  [MedicalSpecialties.CARDIOLOGY]: 'Cardiology',
  [MedicalSpecialties.DERMATOLOGY]: 'Dermatology',
  [MedicalSpecialties.ENDOCRINOLOGY]: 'Endocrinology',
  [MedicalSpecialties.GASTROENTEROLOGY]: 'Gastroenterology',
  [MedicalSpecialties.GYNECOLOGY]: 'Gynecology',
  [MedicalSpecialties.NEUROLOGY]: 'Neurology',
  [MedicalSpecialties.OPHTHALMOLOGY]: 'Ophthalmology',
  [MedicalSpecialties.ORTHOPEDICS]: 'Orthopedics',
  [MedicalSpecialties.PEDIATRICS]: 'Pediatrics',
  [MedicalSpecialties.PSYCHIATRY]: 'Psychiatry',
  [MedicalSpecialties.UROLOGY]: 'Urology',
}

export class Specialty {
  private constructor(private readonly _value: MedicalSpecialtyType) {}

  get value(): MedicalSpecialtyType {
    return this._value
  }

  get label(): string {
    return specialtyLabels[this._value]
  }

  static create(value: string): Result<Specialty, ValidationError> {
    const validValues = Object.values(MedicalSpecialties) as string[]

    if (!validValues.includes(value)) {
      return Result.fail(new ValidationError('specialty', `Invalid specialty: ${value}`))
    }

    return Result.ok(new Specialty(value as MedicalSpecialtyType))
  }

  static fromValue(value: MedicalSpecialtyType): Specialty {
    return new Specialty(value)
  }

  static allSpecialties(): Specialty[] {
    return Object.values(MedicalSpecialties).map((value) => new Specialty(value))
  }

  equals(other: Specialty): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
