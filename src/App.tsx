import { AuthProvider, RepositoriesProvider } from '@presentation/contexts'
import { useAuth } from '@presentation/contexts/auth-context'
import { AppLayout } from '@presentation/components/app-layout'
import { LoginPage } from '@presentation/components/login-page'
import { PatientDashboard } from '@presentation/components/patient-dashboard'
import { ProviderDashboard } from '@presentation/components/provider-dashboard'
import { AdminDashboard } from '@presentation/components/admin-dashboard'

function AppContent() {
  const { currentUser, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />
  }

  const renderDashboard = () => {
    if (currentUser.isPatient()) {
      return <PatientDashboard />
    }

    if (currentUser.isProvider()) {
      return <ProviderDashboard />
    }

    if (currentUser.isAdmin()) {
      return <AdminDashboard />
    }

    return null
  }

  return (
    <AppLayout role={currentUser.role.value} userName={currentUser.name} onLogout={logout}>
      {renderDashboard()}
    </AppLayout>
  )
}

export function App() {
  return (
    <RepositoriesProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RepositoriesProvider>
  )
}
