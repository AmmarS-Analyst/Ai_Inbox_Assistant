'use client';

import { useState, useEffect } from 'react';
import { Ticket, getTickets, deleteTicket } from '@/lib/api';
import Loader from './Loader';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

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
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'open'
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  if (loading && tickets.length === 0) {
    return <Loader />;
  }

  // Get unique languages from tickets (TS-safe: avoid Set iteration spread which can
  // cause errors when target/lib is older than ES2015)
  const availableLanguages = tickets
    .map((ticket) => ticket.language)
    .filter(Boolean) as string[];

  // Dedupe while preserving order
  const uniqueLanguages = availableLanguages.reduce<string[]>((acc, lang) => {
    if (!acc.includes(lang)) acc.push(lang);
    return acc;
  }, []);
  
  // Language name mapping
  const languageNames: { [key: string]: string } = {
    en: 'English',
    ar: 'Arabic',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    // Add more languages as needed
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span className="font-mono">INBOX</span>
          </div>
          <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Tickets
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <Link
            href="/"
            className="px-6 py-2.5 ai-gradient text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/25 dark:shadow-blue-800/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Ticket
          </Link>
        </div>
      </div>

  {/* Filters */}
  <div className="p-6 card backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search messages, intent..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-all duration-200"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-all duration-200"
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {languageNames[lang] || lang}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2.5 ai-gradient text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/25 dark:shadow-blue-800/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414v6.586a1 1 0 01-1.414.707l-2-1a1 1 0 01-.586-.707V13.707L4.293 7.293A1 1 0 014 6.586V4z"/>
            </svg>
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 glass-effect rounded-lg hover:bg-gray-100/10 text-gray-700 dark:text-gray-200 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tickets List */}
        {tickets.length === 0 ? (
        <div className="text-center py-12 muted">
          No tickets found. Create your first ticket by analyzing a message.
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-6 card backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 hover:scale-[1.01] transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {ticket.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      {ticket.priority}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      {ticket.channel}
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                      </svg>
                      {languageNames[ticket.language] || ticket.language}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-2">
                    {ticket.intent || 'No intent'}
                  </h3>
                  {ticket.contact_name && (
                    <p className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {ticket.contact_name}
                      </span>
                      {ticket.contact_email && (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                          </svg>
                          {ticket.contact_email}
                        </span>
                      )}
                      {ticket.contact_phone && (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                          {ticket.contact_phone}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="px-4 py-2 ai-gradient text-white rounded-lg hover:opacity-90 text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 dark:shadow-blue-800/20 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    View
                  </Link>
                  <button
                    onClick={() => ticket.id && handleDelete(ticket.id)}
                    className="px-4 py-2 glass-effect text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {ticket.message_raw}
                </p>
              </div>
              {ticket.entities && ticket.entities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {ticket.entities.map((entity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center gap-2"
                    >
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      <strong className="font-medium">{entity.type}:</strong> {entity.value}
                    </span>
                  ))}
                </div>
              )}
              {ticket.created_at && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
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
