import { ReactNode } from 'react'
import { UserRoleType } from '@domain/auth'

interface AppLayoutProps {
  children: ReactNode
  role: UserRoleType
  userName: string
  onLogout: () => void
}

const ROLE_CONFIG: Record<UserRoleType, { label: string; description: string; color: string }> = {
  patient: {
    label: 'Patient',
    description: 'Manage your appointments',
    color: 'bg-emerald-100 text-emerald-700',
  },
  provider: {
    label: 'Provider',
    description: 'Manage your schedule',
    color: 'bg-blue-100 text-blue-700',
  },
  admin: {
    label: 'Administrator',
    description: 'System overview',
    color: 'bg-violet-100 text-violet-700',
  },
}

export function AppLayout({ children, role, userName, onLogout }: AppLayoutProps) {
  const config = ROLE_CONFIG[role]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-slate-900">CareFlow</span>
              </div>
              
              <div className="hidden sm:block h-6 w-px bg-slate-200" />
              
              <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{config.description}</p>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

