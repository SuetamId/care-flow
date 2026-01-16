import { Result } from '@shared/types'
import { AuthorizationError } from '@shared/errors'
import { AuthenticatedUser } from '../entities'

export interface Credentials {
  email: string
  password: string
}

export interface AuthService {
  login(credentials: Credentials): Promise<Result<AuthenticatedUser, AuthorizationError>>
  logout(): Promise<void>
  getCurrentUser(): AuthenticatedUser | null
  isAuthenticated(): boolean
}
