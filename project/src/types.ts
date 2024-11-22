export interface Order {
  id: string;
  customer_name: string;
  amount: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}