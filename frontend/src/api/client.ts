import type {
  EventType,
  Slot,
  Event,
  CreateEventRequest,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  GenerateSlotsRequest,
} from '../types/api'

const BASE = '/api'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export const api = {
  eventTypes: {
    list: () => request<EventType[]>('/event-types'),
    create: (body: CreateEventTypeRequest) =>
      request<EventType>('/event-types', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: UpdateEventTypeRequest) =>
      request<EventType>(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/event-types/${id}`, { method: 'DELETE' }),
  },
  slots: {
    list: () => request<Slot[]>('/slots'),
    generate: (body: GenerateSlotsRequest) =>
      request<Slot[]>('/slots/generate', { method: 'POST', body: JSON.stringify(body) }),
  },
  events: {
    list: () => request<Event[]>('/events'),
    create: (body: CreateEventRequest) =>
      request<Event>('/events', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/events/${id}`, { method: 'DELETE' }),
  },
}
