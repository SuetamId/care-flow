import { DomainError } from './domain-error'

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND'
  readonly entity: string

  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier "${identifier}" was not found`)
    this.entity = entity
  }
}
