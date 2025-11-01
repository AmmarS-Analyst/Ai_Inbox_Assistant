'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractTicket, createTicket, Ticket } from '@/lib/api';
import TicketForm from '@/components/TicketForm';
import Loader from '@/components/Loader';

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedTicket, setExtractedTicket] = useState<Ticket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const translations = {
    en: {
      title: 'AI Inbox Assistant',
      subtitle: 'Transform messy messages into structured tickets',
      pasteMessage: 'Paste your message here (email, WhatsApp, chat, etc.)',
      analyze: 'Analyze',
      analyzing: 'Analyzing...',
      editBeforeSave: 'Edit the extracted information before saving',
      goToTickets: 'View All Tickets',
      toggleLanguage: 'العربية',
    },
    ar: {
      title: 'مساعد البريد الوارد بالذكاء الاصطناعي',
      subtitle: 'حول الرسائل الفوضوية إلى تذاكر منظمة',
      pasteMessage: 'الصق رسالتك هنا (بريد إلكتروني، واتساب، دردشة، إلخ)',
      analyze: 'تحليل',
      analyzing: 'جارٍ التحليل...',
      editBeforeSave: 'قم بتعديل المعلومات المستخرجة قبل الحفظ',
      goToTickets: 'عرض جميع التذاكر',
      toggleLanguage: 'English',
    },
  };

  const t = translations[language];

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please paste a message first');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractedTicket(null);

    try {
      const response = await extractTicket(message);
      const ticket = response.data;
      
      // Transform contact object to flat structure for form
      const flatTicket: Ticket = {
        ...ticket,
        contact_name: ticket.contact_name || (ticket as any).contact?.name || null,
        contact_email: ticket.contact_email || (ticket as any).contact?.email || null,
        contact_phone: ticket.contact_phone || (ticket as any).contact?.phone || null,
      };

      // Detect language from extracted ticket
      if (ticket.language === 'ar') {
        setLanguage('ar');
      }

      setExtractedTicket(flatTicket);
      setShowForm(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.details ||
        'Failed to analyze message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (ticket: Ticket) => {
    router.push('/tickets');
  };

  const handleNewAnalysis = () => {
    setMessage('');
    setExtractedTicket(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {t.toggleLanguage}
              </button>
              <button
                onClick={() => router.push('/tickets')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                {t.goToTickets}
              </button>
            </div>
          </div>

          {!showForm ? (
            /* Message Input */
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t.pasteMessage}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={
                    language === 'en'
                      ? 'Paste your message here...\n\nExample:\nHi, my name is John Smith and I\'m emailing from john@example.com. I have a billing question about my invoice dated November 15th. The amount was $299. Can you help me urgently? Thanks!'
                      : 'الصق رسالتك هنا...\n\nمثال:\nمرحبا، اسمي أحمد محمد. عندي مشكلة في الفاتورة المؤرخة في 15 نوفمبر. المبلغ 1500 ريال. أحتاج مساعدة عاجلة. بريد: ahmed@example.com'
                  }
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !message.trim()}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader />
                      <span className="ml-2">{t.analyzing}</span>
                    </span>
                  ) : (
                    t.analyze
                  )}
                </button>
              </div>
            </div>
          ) : extractedTicket ? (
            /* Ticket Form */
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t.editBeforeSave}</h2>
                  <button
                    onClick={handleNewAnalysis}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    {language === 'en' ? 'New Analysis' : 'تحليل جديد'}
                  </button>
                </div>
                <TicketForm ticket={extractedTicket} onSave={handleSave} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

