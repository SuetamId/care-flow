import { useState } from 'react'
import { useAuth, MOCK_USERS, MockUser } from '../contexts/auth-context'
import { UserRoleType } from '@domain/auth'

const ROLE_CONFIG: Record<UserRoleType, { label: string; color: string; bgColor: string }> = {
  patient: {
    label: 'Patient',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
  },
  provider: {
    label: 'Provider',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-300',
  },
  admin: {
    label: 'Admin',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200 hover:border-violet-300',
  },
}

function UserCard({ user, onSelect, selected }: { user: MockUser; onSelect: () => void; selected: boolean }) {
  const config = ROLE_CONFIG[user.role]
  
  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all
        ${selected 
          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
          : `${config.bgColor}`
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
          ${selected ? 'bg-primary-600 text-white' : `${config.color} bg-white`}
        `}>
          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{user.name}</p>
          <p className="text-sm text-slate-500 truncate">{user.email}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-md ${config.color} bg-white`}>
          {config.label}
        </span>
      </div>
    </button>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null)

  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser)
    }
  }

  const patientUsers = MOCK_USERS.filter(u => u.role === 'patient')
  const providerUsers = MOCK_USERS.filter(u => u.role === 'provider')
  const adminUsers = MOCK_USERS.filter(u => u.role === 'admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/20">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to CareFlow</h1>
          <p className="text-slate-500">Select a user to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">Patients</h3>
              <div className="space-y-2">
                {patientUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    selected={selectedUser?.id === user.id}
                    onSelect={() => setSelectedUser(user)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Healthcare Providers</h3>
              <div className="space-y-2">
                {providerUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    selected={selectedUser?.id === user.id}
                    onSelect={() => setSelectedUser(user)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">Administrators</h3>
              <div className="space-y-2">
                {adminUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    selected={selectedUser?.id === user.id}
                    onSelect={() => setSelectedUser(user)}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="
              w-full mt-6 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl
              hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-600
              transition-colors
            "
          >
            {selectedUser ? `Continue as ${selectedUser.name.split(' ')[0]}` : 'Select a user to continue'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          This is a demo environment with mock authentication
        </p>
      </div>
    </div>
  )
}
