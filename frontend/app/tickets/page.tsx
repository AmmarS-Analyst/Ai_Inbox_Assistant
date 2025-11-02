import TicketList from '@/components/TicketList';

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03] -z-10"></div>
      <div className="container mx-auto px-4 py-12 max-w-7xl relative">
        <TicketList />
      </div>
    </div>
  );
}

