export type UserRole = 'client' | 'professional';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SessionUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  businessName: string | null;
}

export interface Professional {
  id: string;
  name: string;
  businessName: string;
  bio: string;
  area: string;
  rating: number;
  reviewCount: number;
  categoryId: string;
  categoryName: string;
  serviceNames: string;
}

export interface Service {
  id: string;
  professionalId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  durationMinutes: number;
  priceCents: number;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
}

export interface AppointmentSummary {
  id: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  durationMinutes: number;
  priceCents: number;
  date: string;
  startTime: string;
  status: AppointmentStatus;
  note: string | null;
}
