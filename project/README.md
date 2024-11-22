![irtual scrolling table with cursor-based pagination](image-url)


# Virtual Scrolling Table with Cursor-based Pagination

A high-performance full-stack application demonstrating virtual scrolling with cursor-based pagination, handling 10,000 records efficiently.

## Features

- Virtual scrolling implementation
- Cursor-based pagination
- Sorting by any column
- Real-time performance optimization
- Error handling and loading states
- MySQL database with proper indexing

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Seed the database:
   ```bash
   python manage.py seed_orders
   ```

3. Start the backend server:
   ```bash
   python manage.py runserver
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Base URL
```
http://localhost:8000/api/
```

### Endpoints

#### Get Orders
```http
GET /orders/
```

Retrieves a paginated list of orders with sorting capabilities.

##### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| cursor | string | Pagination cursor for the next set of results |
| sort_field | string | Field to sort by. Options: `id`, `customer_name`, `amount`, `status`, `created_at` |
| sort_direction | string | Sort direction. Options: `asc`, `desc` |

##### Response Format

```json
{
  "count": 10000,
  "next": "http://localhost:8000/api/orders/?cursor=cD0yMDI0LTAyLTI5KzIzJTNBMTglM0ExNi4xMjM0NTYlMkI=",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "John Doe",
      "amount": "199.99",
      "status": "completed",
      "created_at": "2024-02-29T23:18:16.123456Z"
    },
    // ... more orders
  ]
}
```

##### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| count | number | Total number of records |
| next | string\|null | URL for the next page of results |
| previous | string\|null | URL for the previous page of results |
| results | array | Array of order objects |

##### Order Object

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID of the order |
| customer_name | string | Name of the customer |
| amount | string | Order amount (decimal) |
| status | string | Order status: `pending`, `completed`, or `cancelled` |
| created_at | string | ISO 8601 timestamp |

##### Example Request

```http
GET /api/orders/?sort_field=created_at&sort_direction=desc
```

##### Example Response

```json
{
  "count": 10000,
  "next": "http://localhost:8000/api/orders/?cursor=cD0yMDI0LTAyLTI5KzIzJTNBMTglM0ExNi4xMjM0NTYlMkI=",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "John Doe",
      "amount": "199.99",
      "status": "completed",
      "created_at": "2024-02-29T23:18:16.123456Z"
    }
  ]
}
```

##### Error Responses

```json
{
  "detail": "Invalid cursor"
}
```

Status Code: 400 Bad Request

## Performance Notes

- Virtual scrolling ensures only visible rows are rendered
- Cursor-based pagination reduces database load
- Proper indexing on frequently queried columns
- Efficient state management with React Query
- Minimal re-renders through proper component optimization

## Potential Improvements

1. Add search functionality
2. Implement filters
3. Add column resizing
4. Export functionality
5. Server-side caching
6. Real-time updates
7. Column customization
8. Row selection and bulk actions
