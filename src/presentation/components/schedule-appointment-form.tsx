import { useState, useEffect, FormEvent } from 'react'
import { Patient } from '@domain/patient'
import { Provider } from '@domain/provider'
import { useAuth } from '../contexts/auth-context'
import { useRepositories } from '../contexts/repositories-context'
import { useAppointments } from '../hooks/use-appointments'
import { ErrorDisplay } from './error-display'

interface FormData {
  patientId: string
  providerId: string
  date: string
  startTime: string
  duration: string
  reason: string
}

const INITIAL_FORM: FormData = {
  patientId: '',
  providerId: '',
  date: '',
  startTime: '',
  duration: '30',
  reason: '',
}

interface ScheduleAppointmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ScheduleAppointmentForm({ onSuccess, onCancel }: ScheduleAppointmentFormProps) {
  const { currentUser } = useAuth()
  const { patientRepository, providerRepository, isInitialized } = useRepositories()
  const { schedule, loading, error } = useAppointments()

  const [patients, setPatients] = useState<Patient[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [patientsData, providersData] = await Promise.all([
        patientRepository.findAll(),
        providerRepository.findAll({ isActive: true }),
      ])
      setPatients(patientsData)
      setProviders(providersData)
    }

    if (isInitialized) {
      loadData()
    }
  }, [isInitialized, patientRepository, providerRepository])

  useEffect(() => {
    if (currentUser?.isPatient()) {
      setFormData((prev) => ({ ...prev, patientId: currentUser.entityId }))
    }
  }, [currentUser])

  const canSchedule = currentUser?.isPatient() || currentUser?.isAdmin()

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Please log in to schedule appointments.</p>
      </div>
    )
  }

  if (!canSchedule) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Only patients and admins can schedule appointments.</p>
      </div>
    )
  }

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    const date = new Date(formData.date)
    const [hours, minutes] = formData.startTime.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    const durationMinutes = parseInt(formData.duration, 10)
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

    const result = await schedule({
      patientId: formData.patientId,
      providerId: formData.providerId,
      startTime,
      endTime,
      reason: formData.reason,
    })

    if (result) {
      setSuccess(true)
      setFormData({
        ...INITIAL_FORM,
        patientId: currentUser.isPatient() ? currentUser.entityId : '',
      })
      onSuccess?.()
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const inputClasses = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
  const labelClasses = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div>
      <ErrorDisplay error={error} />

      {success && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-700 font-medium">Appointment scheduled successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>Patient</label>
            <select
              value={formData.patientId}
              onChange={handleChange('patientId')}
              required
              disabled={currentUser.isPatient()}
              className={`${inputClasses} ${currentUser.isPatient() ? 'bg-slate-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Provider</label>
            <select
              value={formData.providerId}
              onChange={handleChange('providerId')}
              required
              className={inputClasses}
            >
              <option value="">Select provider...</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.specialty.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClasses}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              min={today}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={handleChange('startTime')}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Duration</label>
            <select
              value={formData.duration}
              onChange={handleChange('duration')}
              className={inputClasses}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Reason for Visit</label>
          <textarea
            value={formData.reason}
            onChange={handleChange('reason')}
            required
            rows={3}
            placeholder="Describe the reason for the appointment..."
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}
