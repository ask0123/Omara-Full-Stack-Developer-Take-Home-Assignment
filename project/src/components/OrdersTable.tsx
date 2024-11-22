import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { type Order } from '../types';

const ROW_HEIGHT = 48;
const BUFFER_SIZE = 5;

export function OrdersTable() {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [sortField, setSortField] = useState<keyof Order>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', visibleRange, sortField, sortDirection],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3000/api/orders`, {
        params: {
          limit: visibleRange.end - visibleRange.start,
          offset: visibleRange.start,
          sortField,
          sortDirection,
        },
      });
      setTotalHeight(response.data.total * ROW_HEIGHT);
      return response.data;
    },
  });

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      Math.ceil((scrollTop + clientHeight) / ROW_HEIGHT) + BUFFER_SIZE
    );

    setVisibleRange({ start, end });
  }, []);

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
        Error loading data: {(error as Error).message}
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
        style={{ position: 'relative' }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {['id', 'customerName', 'amount', 'status', 'createdAt'].map((field) => (
                <th
                  key={field}
                  className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(field as keyof Order)}
                >
                  <div className="flex items-center gap-1">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                    <SortIcon field={field as keyof Order} />
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
              <div
                style={{
                  height: totalHeight,
                  position: 'relative',
                }}
              >
                {data?.orders.map((order: Order) => (
                  <div
                    key={order.id}
                    style={{
                      position: 'absolute',
                      top: order.rowIndex * ROW_HEIGHT,
                      width: '100%',
                      height: ROW_HEIGHT,
                    }}
                  >
                    <div className="grid grid-cols-5 h-full">
                      <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.id}
                      </div>
                      <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.amount.toFixed(2)}
                      </div>
                      <div className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}