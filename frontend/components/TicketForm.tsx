'use client';

import { useState } from 'react';
import { Ticket, createTicket, updateTicket } from '@/lib/api';

interface TicketFormProps {
  ticket?: Ticket;
  onSave?: (ticket: Ticket) => void;
  onCancel?: () => void;
}

export default function TicketForm({ ticket, onSave, onCancel }: TicketFormProps) {
  const [formData, setFormData] = useState<Partial<Ticket>>(
    ticket || {
      status: 'open',
      channel: 'unknown',
      language: 'en',
      intent: '',
      priority: 'low',
      entities: [],
      message_raw: '',
      reply_suggestion: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let savedTicket: Ticket;
      if (ticket?.id) {
        const response = await updateTicket(ticket.id, formData);
        savedTicket = response.data;
      } else {
        const response = await createTicket(formData);
        savedTicket = response.data;
      }
      
      if (onSave) {
        onSave(savedTicket);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Status</label>
          <select
            value={formData.status || 'open'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Priority</label>
          <select
            value={formData.priority || 'low'}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Name</label>
            <input
              type="text"
              value={formData.contact_name || ''}
              onChange={(e) => handleChange('contact_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Email</label>
            <input
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Phone</label>
            <input
              type="tel"
              value={formData.contact_phone || ''}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Channel and Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Channel</label>
          <select
            value={formData.channel || 'unknown'}
            onChange={(e) => handleChange('channel', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="chat">Chat</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Language</label>
          <input
            type="text"
            value={formData.language || 'en'}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
            placeholder="en, ar, fr, etc."
          />
        </div>
      </div>

      {/* Intent */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Intent</label>
        <input
          type="text"
          value={formData.intent || ''}
          onChange={(e) => handleChange('intent', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
          placeholder="e.g., billing question, maintenance request"
        />
      </div>

      {/* Entities */}
      {formData.entities && formData.entities.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Extracted Entities</label>
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-slate-700">
            {formData.entities.map((entity, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm font-medium">
                  {entity.type}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{entity.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Message */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Original Message</label>
        <textarea
          value={formData.message_raw || ''}
          onChange={(e) => handleChange('message_raw', e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Reply Suggestion */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Reply Suggestion</label>
        <textarea
          value={formData.reply_suggestion || ''}
          onChange={(e) => handleChange('reply_suggestion', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
          dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
        >
          {loading ? 'Saving...' : ticket?.id ? 'Update Ticket' : 'Save Ticket'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

