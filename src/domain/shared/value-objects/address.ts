import { Result } from '@shared/types'
import { ValidationError } from '@shared/errors'

interface AddressProps {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export class Address {
  private constructor(private readonly _props: AddressProps) {}

  get street(): string {
    return this._props.street
  }

  get number(): string {
    return this._props.number
  }

  get complement(): string | undefined {
    return this._props.complement
  }

  get neighborhood(): string {
    return this._props.neighborhood
  }

  get city(): string {
    return this._props.city
  }

  get state(): string {
    return this._props.state
  }

  get zipCode(): string {
    return this._props.zipCode
  }

  get country(): string {
    return this._props.country
  }

  static create(props: AddressProps): Result<Address, ValidationError> {
    if (!props.street.trim()) {
      return Result.fail(new ValidationError('street', 'Street is required'))
    }

    if (!props.number.trim()) {
      return Result.fail(new ValidationError('number', 'Number is required'))
    }

    if (!props.neighborhood.trim()) {
      return Result.fail(new ValidationError('neighborhood', 'Neighborhood is required'))
    }

    if (!props.city.trim()) {
      return Result.fail(new ValidationError('city', 'City is required'))
    }

    if (!props.state.trim()) {
      return Result.fail(new ValidationError('state', 'State is required'))
    }

    if (!props.zipCode.trim()) {
      return Result.fail(new ValidationError('zipCode', 'ZIP code is required'))
    }

    if (!props.country.trim()) {
      return Result.fail(new ValidationError('country', 'Country is required'))
    }

    return Result.ok(
      new Address({
        street: props.street.trim(),
        number: props.number.trim(),
        complement: props.complement?.trim(),
        neighborhood: props.neighborhood.trim(),
        city: props.city.trim(),
        state: props.state.trim(),
        zipCode: props.zipCode.replace(/\D/g, ''),
        country: props.country.trim(),
      })
    )
  }

  formatted(): string {
    const parts = [
      `${this._props.street}, ${this._props.number}`,
      this._props.complement,
      this._props.neighborhood,
      `${this._props.city} - ${this._props.state}`,
      this._props.zipCode,
      this._props.country,
    ].filter(Boolean)

    return parts.join(', ')
  }

  equals(other: Address): boolean {
    return (
      this._props.street === other._props.street &&
      this._props.number === other._props.number &&
      this._props.complement === other._props.complement &&
      this._props.neighborhood === other._props.neighborhood &&
      this._props.city === other._props.city &&
      this._props.state === other._props.state &&
      this._props.zipCode === other._props.zipCode &&
      this._props.country === other._props.country
    )
  }
}
