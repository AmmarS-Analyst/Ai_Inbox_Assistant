'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTicketById, updateTicket, Ticket } from '@/lib/api';
import TicketForm from '@/components/TicketForm';
import Loader from '@/components/Loader';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await getTicketById(id);
        const ticketData = response.data;
        
        // Transform contact object to flat structure if needed
        const flatTicket: Ticket = {
          ...ticketData,
          contact_name: ticketData.contact_name || (ticketData as any).contact?.name || null,
          contact_email: ticketData.contact_email || (ticketData as any).contact?.email || null,
          contact_phone: ticketData.contact_phone || (ticketData as any).contact?.phone || null,
        };
        
        setTicket(flatTicket);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const handleSave = (updatedTicket: Ticket) => {
    router.push('/tickets');
  };

  const handleCancel = () => {
    router.push('/tickets');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <Loader />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || 'Ticket not found'}
          </div>
          <button
            onClick={() => router.push('/tickets')}
            className="mt-4 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => router.push('/tickets')}
            className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 mb-4 transition-colors"
          >
            ← Back to Tickets
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Ticket #{ticket.id}</h1>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700 transition-colors">
          <TicketForm ticket={ticket} onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}

