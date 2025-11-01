'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractTicket, createTicket, Ticket } from '@/lib/api';
import TicketForm from '@/components/TicketForm';
import Loader from '@/components/Loader';
import ThemeToggle from '@/components/ThemeToggle';

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">{t.subtitle}</p>
            </div>
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors"
              >
                {t.toggleLanguage}
              </button>
              <button
                onClick={() => router.push('/tickets')}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
              >
                {t.goToTickets}
              </button>
            </div>
          </div>

          {!showForm ? (
            /* Message Input */
            <div className="card p-8">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t.pasteMessage}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder={
                    language === 'en'
                      ? 'Paste your message here...\n\nExample:\nHi, my name is John Smith and I\'m emailing from john@example.com. I have a billing question about my invoice dated November 15th. The amount was $299. Can you help me urgently? Thanks!'
                      : 'الصق رسالتك هنا...\n\nمثال:\nمرحبا، اسمي أحمد محمد. عندي مشكلة في الفاتورة المؤرخة في 15 نوفمبر. المبلغ 1500 ريال. أحتاج مساعدة عاجلة. بريد: ahmed@example.com'
                  }
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !message.trim()}
                  className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
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
              <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.editBeforeSave}</h2>
                  <button
                    onClick={handleNewAnalysis}
                    className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
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

