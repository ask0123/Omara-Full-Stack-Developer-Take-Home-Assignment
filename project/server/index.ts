import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';

const app = express();
const db = new Database('orders.db');

app.use(cors());
app.use(express.json());

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'completed', 'cancelled')) NOT NULL,
    createdAt TEXT NOT NULL
  );
  
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
`);

const querySchema = z.object({
  limit: z.string().transform(Number).default('20'),
  offset: z.string().transform(Number).default('0'),
  sortField: z.enum(['id', 'customerName', 'amount', 'status', 'createdAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

app.get('/api/orders', (req, res) => {
  try {
    const { limit, offset, sortField, sortDirection } = querySchema.parse(req.query);
    
    const total = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    
    const orders = db.prepare(`
      SELECT *, (ROW_NUMBER() OVER (ORDER BY ${sortField} ${sortDirection}) - 1) as rowIndex
      FROM orders
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({ orders, total });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(400).json({ error: 'Invalid request parameters' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});