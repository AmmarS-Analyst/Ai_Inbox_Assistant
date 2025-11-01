import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Contact {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Entity {
  type: string;
  value: string;
}

export interface Ticket {
  id?: number;
  status: string;
  created_at?: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  channel: string;
  language: string;
  intent: string;
  priority: 'low' | 'medium' | 'high';
  entities: Entity[];
  message_raw: string;
  reply_suggestion: string;
}

export interface ExtractResponse {
  success: boolean;
  data: Ticket;
  metadata?: {
    priority_source: string;
    rule_based_priority: string;
  };
}

export interface TicketsResponse {
  success: boolean;
  data: Ticket[];
  count: number;
}

// AI Extraction
export const extractTicket = async (message: string): Promise<ExtractResponse> => {
  const response = await api.post<ExtractResponse>('/ai/extract', { message });
  return response.data;
};

// Tickets CRUD
export const createTicket = async (ticket: Partial<Ticket>): Promise<{ success: boolean; data: Ticket }> => {
  const response = await api.post('/tickets', ticket);
  return response.data;
};

export const getTickets = async (filters?: {
  status?: string;
  priority?: string;
  language?: string;
  search?: string;
}): Promise<TicketsResponse> => {
  const response = await api.get<TicketsResponse>('/tickets', { params: filters });
  return response.data;
};

export const getTicketById = async (id: number): Promise<{ success: boolean; data: Ticket }> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const updateTicket = async (id: number, ticket: Partial<Ticket>): Promise<{ success: boolean; data: Ticket }> => {
  const response = await api.put(`/tickets/${id}`, ticket);
  return response.data;
};

export const deleteTicket = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

export default api;

