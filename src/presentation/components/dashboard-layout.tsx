import { ReactNode } from 'react'
import { UserRoleType } from '@domain/auth'

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRoleType
  userName: string
  onRoleSwitch: (role: UserRoleType) => void
}

const ROLE_CONFIG: Record<UserRoleType, { label: string; description: string }> = {
  patient: {
    label: 'Patient',
    description: 'Manage your appointments',
  },
  provider: {
    label: 'Provider',
    description: 'Manage your schedule',
  },
  admin: {
    label: 'Administrator',
    description: 'System overview',
  },
}

const ROLES: UserRoleType[] = ['patient', 'provider', 'admin']

export function DashboardLayout({ children, role, userName, onRoleSwitch }: DashboardLayoutProps) {
  const config = ROLE_CONFIG[role]

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.brand}>
            <h1 style={styles.title}>CareFlow</h1>
            <span style={styles.divider}>|</span>
            <span style={styles.roleLabel}>{config.label} Dashboard</span>
          </div>

          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{userName}</span>
              <span style={styles.userRole}>{config.description}</span>
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          <span style={styles.navLabel}>Switch view:</span>
          <div style={styles.roleButtons}>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => onRoleSwitch(r)}
                style={{
                  ...styles.roleButton,
                  ...(role === r ? styles.activeRoleButton : {}),
                }}
                disabled={role === r}
              >
                {ROLE_CONFIG[r].label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  divider: {
    color: '#d1d5db',
    fontSize: '24px',
    fontWeight: 300,
  },
  roleLabel: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#4b5563',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
  },
  userRole: {
    fontSize: '12px',
    color: '#6b7280',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid #f3f4f6',
  },
  navLabel: {
    fontSize: '13px',
    color: '#6b7280',
  },
  roleButtons: {
    display: 'flex',
    gap: '8px',
  },
  roleButton: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#374151',
    cursor: 'pointer',
  },
  activeRoleButton: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
    color: '#fff',
    cursor: 'default',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
}
