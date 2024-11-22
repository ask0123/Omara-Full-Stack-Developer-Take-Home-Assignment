import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import type { Order } from '../types';

const ROW_HEIGHT = 48;
const BUFFER_SIZE = 5;

export function VirtualTable() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Order>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', cursor, sortField, sortDirection],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8000/api/orders/`, {
        params: {
          cursor,
          sort_field: sortField,
          sort_direction: sortDirection,
        },
      });
      setTotalHeight(response.data.count * ROW_HEIGHT);
      return response.data;
    },
    retry: 1,
  });

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !data?.next) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    if (scrollBottom < ROW_HEIGHT * BUFFER_SIZE) {
      const nextUrl = new URL(data.next);
      setCursor(nextUrl.searchParams.get('cursor'));
    }
  }, [data?.next]);

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCursor(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading data. Please ensure the Django server is running on port 8000.
      </div>
    );
  }

  const SortIcon = ({ field }: { field: keyof Order }) => {
    if (field !== sortField) return <ArrowDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-indigo-600" /> : 
      <ArrowDown className="h-4 w-4 text-indigo-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div
        ref={containerRef}
        className="h-[600px] overflow-auto"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {[
                { key: 'id', label: 'ID' },
                { key: 'customer_name', label: 'Customer' },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'created_at', label: 'Created At' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(key as keyof Order)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon field={key as keyof Order} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center">
                  <Loader2 className="h-6 w-6 animate-spin inline" />
                </td>
              </tr>
            ) : (
              data?.results.map((order: Order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(order.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}