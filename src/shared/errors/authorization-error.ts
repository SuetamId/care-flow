import { DomainError } from './domain-error'

export class AuthorizationError extends DomainError {
  readonly code = 'UNAUTHORIZED'

  constructor(message: string = 'You are not authorized to perform this action') {
    super(message)
  }
}
