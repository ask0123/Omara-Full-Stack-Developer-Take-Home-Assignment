import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VirtualTable } from './components/VirtualTable';
import { ArrowUpDown } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-6 w-6 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Orders Dashboard</h1>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <VirtualTable />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;