import TicketList from '@/components/TicketList';

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <TicketList />
      </div>
    </div>
  );
}

