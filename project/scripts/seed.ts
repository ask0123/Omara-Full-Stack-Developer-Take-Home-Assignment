import { faker } from '@faker-js/faker';
import Database from 'better-sqlite3';

const db = new Database('orders.db');

// Clear existing data
db.prepare('DELETE FROM orders').run();

const statuses = ['pending', 'completed', 'cancelled'];
const insert = db.prepare(`
  INSERT INTO orders (id, customerName, amount, status, createdAt)
  VALUES (?, ?, ?, ?, ?)
`);

// Create a transaction for better performance
const insertMany = db.transaction((orders) => {
  for (const order of orders) {
    insert.run(
      order.id,
      order.customerName,
      order.amount,
      order.status,
      order.createdAt
    );
  }
});

console.log('Generating 10,000 orders...');

const orders = Array.from({ length: 10000 }, () => ({
  id: faker.string.uuid(),
  customerName: faker.person.fullName(),
  amount: parseFloat(faker.finance.amount(10, 1000, 2)),
  status: faker.helpers.arrayElement(statuses),
  createdAt: faker.date
    .between({ from: '2023-01-01', to: '2024-02-29' })
    .toISOString(),
}));

insertMany(orders);

console.log('Seeding completed!');