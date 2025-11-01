'use client';

import { useState, useEffect } from 'react';
import { Ticket, getTickets, deleteTicket } from '@/lib/api';
import Loader from './Loader';
import Link from 'next/link';

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    language: '',
    search: '',
  });

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await getTickets(activeFilters);
      setTickets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchTickets();
  };

  const handleClearFilters = () => {
    setFilters({ status: '', priority: '', language: '', search: '' });
    setTimeout(() => fetchTickets(), 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await deleteTicket(id);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'open'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (loading && tickets.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search messages, intent..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tickets found. Create your first ticket by analyzing a message.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {ticket.channel} • {ticket.language}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{ticket.intent || 'No intent'}</h3>
                  {ticket.contact_name && (
                    <p className="text-sm text-gray-600">
                      {ticket.contact_name}
                      {ticket.contact_email && ` • ${ticket.contact_email}`}
                      {ticket.contact_phone && ` • ${ticket.contact_phone}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => ticket.id && handleDelete(ticket.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {ticket.message_raw}
              </p>
              {ticket.entities && ticket.entities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {ticket.entities.map((entity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {entity.type}: {entity.value}
                    </span>
                  ))}
                </div>
              )}
              {ticket.created_at && (
                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(ticket.created_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

