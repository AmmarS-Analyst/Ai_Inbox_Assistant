'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractTicket, createTicket, Ticket } from '@/lib/api';
import TicketForm from '@/components/TicketForm';
import Loader from '@/components/Loader';
import { useLanguage } from '@/contexts/LanguageContext';
import { MailIcon, AnalyzeIcon, SparkIcon, OrganizeIcon, InsightsIcon, CheckIcon } from '@/components/icons/Icons';

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedTicket, setExtractedTicket] = useState<Ticket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { lang: language, setLanguage } = useLanguage();

  const translations = {
    en: {
      title: 'Inbox Assistant',
      subtitle: 'Transform messy messages into structured tickets',
      pasteMessage: 'Paste your message here (email, WhatsApp, chat, etc.)',
      analyze: 'Analyze',
      analyzing: 'Analyzing...',
      editBeforeSave: 'Edit the extracted information before saving',
      goToTickets: 'View All Tickets',
      toggleLanguage: 'العربية',
    },
    ar: {
      title: 'مساعد البريد الوارد',
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
      
  
      const flatTicket: Ticket = {
        ...ticket,
        contact_name: ticket.contact_name || (ticket as any).contact?.name || null,
        contact_email: ticket.contact_email || (ticket as any).contact?.email || null,
        contact_phone: ticket.contact_phone || (ticket as any).contact?.phone || null,
      };

      
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-200">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03] -z-10"></div>
        <div className="container mx-auto px-4 py-12 max-w-6xl relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-6xl sm:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-300 dark:via-blue-300 dark:to-cyan-300 mb-4 leading-tight tracking-tight">
                {t.title}
              </h1>
              <div className="relative">
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl font-display leading-relaxed">
                  {t.subtitle}
                  <span className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-full"></span>
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <SparkIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Instant Analysis</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <OrganizeIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Smart Organization</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <InsightsIcon className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Smart insights</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-center md:justify-end">
              {/* Language toggle removed from main page  use NavBar control instead */}
            </div>
          </div>

          {!showForm ? (
            /* Message Input */
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-3">
                <div className="card p-8 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full ai-gradient flex items-center justify-center">
                        <MailIcon className="w-6 h-6 text-white" />
                      </div>
                      <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                        {t.pasteMessage}
                      </label>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={12}
                      className="w-full px-6 py-4 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 shadow-sm"
                      placeholder={
                        language === 'en'
                          ? 'Paste your message here...\n\nExample:\nHi, my name is John Smith and I\'m emailing from john@example.com. I have a billing question about my invoice dated November 15th. The amount was $299. Can you help me urgently? Thanks!'
                          : 'الصق رسالتك هنا...\n\nمثال:\nمرحبا، اسمي أحمد محمد. عندي مشكلة في الفاتورة المؤرخة في 15 نوفمبر. المبلغ 1500 ريال. أحتاج مساعدة عاجلة. بريد: ahmed@example.com'
                      }
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                          </svg>
                          {error}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleAnalyze}
                      disabled={loading || !message.trim()}
                      className="w-full px-6 py-4 ai-gradient text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-lg shadow-blue-500/25 dark:shadow-blue-800/20 transition-all duration-200 group"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader />
                          <span className="ml-2">{t.analyzing}</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <AnalyzeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                          {t.analyze}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="card p-8 backdrop-blur-xl bg-white/30 dark:bg-slate-900/30">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">How it works</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">1</div>
                        <p className="text-gray-600 dark:text-gray-300">Paste any message from email, chat, or social media</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">2</div>
                        <p className="text-gray-600 dark:text-gray-300">The assistant analyzes and extracts key information</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-1">3</div>
                        <p className="text-gray-600 dark:text-gray-300">Review and save as a structured ticket</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : extractedTicket ? (
            /* Ticket Form */
            <div className="space-y-6">
              <div className="card p-8 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full ai-gradient flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.editBeforeSave}</h2>
                  </div>
                  <button
                    onClick={handleNewAnalysis}
                    className="px-4 py-2 glass-effect text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {language === 'en' ? 'Discard' : 'تجاهل'}
                  </button>
                </div>
                <TicketForm ticket={extractedTicket} onSave={handleSave} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
  );
}

