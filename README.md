# CareFlow

Healthcare workflow platform focused on patient management and appointment coordination.

## Architecture

This project follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles:

```
src/
├── domain/           # Enterprise business rules (entities, value objects, interfaces)
├── application/      # Application business rules (use cases, DTOs)
├── infrastructure/   # External concerns (API clients, storage, repositories)
├── presentation/     # UI layer (React components, pages, hooks)
└── shared/           # Cross-cutting concerns (types, errors)
```

### Layer Dependencies

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain Layer**: Zero framework dependencies. Contains entities, value objects, repository interfaces, and domain services.
- **Application Layer**: Orchestrates domain logic through use cases. Depends only on domain.
- **Infrastructure Layer**: Implements domain interfaces. Contains API clients, repository implementations.
- **Presentation Layer**: React components. Depends on application layer.

## Domain Model

### Core Domains

- **Patient**: Patient information, contact details, medical history
- **Provider**: Healthcare providers (doctors), specialties, licenses
- **Appointment**: Scheduling, status lifecycle, time slots
- **Clinic**: Healthcare facilities, operating hours

### Business Rules

1. Appointments cannot overlap for the same provider
2. Appointment lifecycle: `scheduled → in_progress → completed → cancelled`
3. Only providers can update clinical status (start/complete appointments)
4. Patients can only view their own data

### Authentication Roles

- **patient**: Can view own data, create/cancel own appointments
- **provider**: Can manage assigned appointments, view assigned patients
- **admin**: Full access to all resources

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── domain/
│   ├── shared/
│   │   └── value-objects/     # Email, Phone, Address, DateOfBirth
│   ├── patient/
│   │   ├── entities/          # Patient entity
│   │   └── repositories/      # PatientRepository interface
│   ├── provider/
│   │   ├── entities/          # Provider entity
│   │   ├── value-objects/     # Specialty, LicenseNumber
│   │   └── repositories/      # ProviderRepository interface
│   ├── clinic/
│   │   ├── entities/          # Clinic entity
│   │   └── repositories/      # ClinicRepository interface
│   ├── appointment/
│   │   ├── entities/          # Appointment entity
│   │   ├── value-objects/     # AppointmentStatus, TimeSlot
│   │   └── repositories/      # AppointmentRepository interface
│   └── auth/
│       ├── entities/          # AuthenticatedUser
│       ├── value-objects/     # UserRole
│       └── services/          # AuthService interface
├── application/               # Use cases (to be implemented)
├── infrastructure/            # Repository implementations (to be implemented)
├── presentation/              # React UI (to be implemented)
└── shared/
    ├── types/                 # Result, UniqueId
    └── errors/                # DomainError, ValidationError, etc.
```

## Tech Stack

- React 18
- TypeScript 5
- Vite 5

## Demo
[Demo](https://care-flow-mu.vercel.app/)
