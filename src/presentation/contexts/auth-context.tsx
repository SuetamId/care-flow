import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { createUniqueId } from '@shared/types'
import { AuthenticatedUser, UserRoleType } from '@domain/auth'
import { Email } from '@domain/shared'

export interface MockUser {
  id: string
  email: string
  name: string
  role: UserRoleType
  entityId: string
}

interface AuthContextValue {
  currentUser: AuthenticatedUser | null
  role: UserRoleType | null
  isAuthenticated: boolean
  login: (mockUser: MockUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user-patient-1',
    email: 'john.doe@email.com',
    name: 'John Doe',
    role: 'patient',
    entityId: 'patient-1',
  },
  {
    id: 'user-patient-2',
    email: 'sarah.wilson@email.com',
    name: 'Sarah Wilson',
    role: 'patient',
    entityId: 'patient-2',
  },
  {
    id: 'user-provider-1',
    email: 'dr.maria.santos@clinic.com',
    name: 'Dr. Maria Santos',
    role: 'provider',
    entityId: 'provider-1',
  },
  {
    id: 'user-provider-2',
    email: 'dr.james.chen@clinic.com',
    name: 'Dr. James Chen',
    role: 'provider',
    entityId: 'provider-2',
  },
  {
    id: 'user-admin-1',
    email: 'admin@careflow.com',
    name: 'System Admin',
    role: 'admin',
    entityId: 'admin-1',
  },
]

function createAuthenticatedUser(mockUser: MockUser): AuthenticatedUser | null {
  const emailResult = Email.create(mockUser.email)

  if (!emailResult.success) return null

  return AuthenticatedUser.create({
    id: createUniqueId(mockUser.id),
    email: emailResult.value,
    name: mockUser.name,
    role: mockUser.role,
    entityId: createUniqueId(mockUser.entityId),
  })
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null)

  const login = useCallback((mockUser: MockUser) => {
    const user = createAuthenticatedUser(mockUser)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const role = currentUser?.role.value ?? null
  const isAuthenticated = currentUser !== null

  return (
    <AuthContext.Provider value={{ currentUser, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
