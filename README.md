# Ticket Desk — Support Ticket Tracker 

> 🚀 **Live Production URL:** [https://support-ticket-rho.vercel.app/](https://support-ticket-rho.vercel.app/)

A modern full-stack support ticket management application built with the MERN stack: create tickets, track statuses and priorities, search/filter issues, and view real-time metrics.

- **M**ongoDB + Mongoose — persistence, schema validation, indexing, and aggregation pipelines
- **E**xpress — RESTful API with Zod schema validation, modular routers, and centralized error handling
- **R**eact (Vite + React Router) — responsive, state-aware UI with loading/empty/error states
- **N**ode.js (v20+) — ES Modules (`import`/`export`) throughout

---

## Project Layout

```text
support-tickets/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app factory (CORS, JSON parser, route mounting)
│   │   ├── index.js            # Server entry point & serverless export
│   │   ├── models/Ticket.js    # Mongoose schema (enums, timestamps, indexes, toJSON transform)
│   │   ├── validation.js       # Zod schemas for pagination, query filters, creation, and updates
│   │   ├── routes/tickets.js   # /api/tickets endpoints (CRUD + aggregation summary)
│   │   ├── middleware/error.js # Centralized 404 & error-handling middleware
│   │   └── seed.js             # Cross-platform seed script for 30 realistic support tickets
│   └── tests/tickets.test.js   # Jest + Supertest + in-memory MongoDB test suite
├── frontend/
│   ├── src/
│   │   ├── api.js              # Centralized fetch wrapper targeting /api
│   │   ├── constants.js        # Statuses, Priorities, and client validation mirroring backend Zod
│   │   ├── main.jsx            # Application entry point with BrowserRouter (/ and /tickets/:id)
│   │   ├── styles.css          # Responsive design tokens, badges, and layout styling
│   │   ├── pages/              # TicketList.jsx (filter, sort, search, pagination), TicketDetail.jsx
│   │   └── components/         # CreateTicketForm.jsx, Badges.jsx
│   ├── vite.config.js          # Vite configuration with local /api proxy
│   └── index.html
├── docs/
│   └── screenshots/            # Demonstration screenshots
├── vercel.json                 # Vercel serverless build and routing configuration
├── .gitignore                  # Ignores node_modules, secrets (.env), and build artifacts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v20 or higher) & **npm**
- **MongoDB**: Either a local MongoDB instance (`mongodb://127.0.0.1:27017/support_tickets`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit `backend/.env` with your MongoDB connection string:
   - **Local MongoDB**: `MONGODB_URI=mongodb://127.0.0.1:27017/support_tickets`
   - **MongoDB Atlas**: `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/support_tickets?retryWrites=true&w=majority`

4. Install backend dependencies:
   ```bash
   npm install
   ```

5. Seed the database with 30 sample support tickets:
   ```bash
   npm run seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   > The API will be running at **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`).

---

### Step 2: Frontend Setup

1. Open a **new terminal** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   > The client interface will be available at **`http://localhost:5173`**.

---

## Environment Variables

| Directory  | Variable        | Default / Example                                | Purpose |
|------------|-----------------|--------------------------------------------------|---------|
| `backend`  | `PORT`          | `5000`                                           | Port for the Express REST API (local) |
| `backend`  | `MONGODB_URI`   | `mongodb://127.0.0.1:27017/support_tickets`      | MongoDB connection string (Atlas or Local) |
| `backend`  | `CLIENT_ORIGIN` | `http://localhost:5173`                          | Allowed CORS origin for frontend requests |

---

## Running Automated Tests

The backend includes a comprehensive Jest test suite using `mongodb-memory-server`. It spins up an isolated, ephemeral in-memory database in RAM, requiring no external or live database to execute.

```bash
cd backend
npm test
```

### Test Coverage Highlights
- **Input Validation**: Schema constraints (120-character titles, valid email formats, strict status/priority enums, 400 responses with field-level details).
- **Query Pipeline**: Pagination (10 per page), combined multi-parameter filtering, case-insensitive search, and sorting.
- **Metrics Aggregation**: Verification that the summary endpoint computes accurate global counts across statuses.
- **Updates & Errors**: Persisted status and priority updates, rejection of unauthorized fields or invalid enum transitions, and proper 404 responses for missing IDs.

---

## API Reference

All endpoints return JSON responses. Errors follow a consistent structure:
`{ "error": { "message": "...", "details": { "field": "..." } } }`

| Method | Endpoint               | Query / Body Params                                  | Description |
|:-------|:-----------------------|:-----------------------------------------------------|:------------|
| `GET`  | `/api/health`          | None                                                 | Health-check status endpoint |
| `GET`  | `/api/tickets`         | `q`, `status`, `priority`, `sort=newest|oldest`, `page` | Paginated ticket list with filtering and search |
| `GET`  | `/api/tickets/summary` | None                                                 | Aggregate counts: `{ total, open, inProgress, resolved }` |
| `GET`  | `/api/tickets/:id`     | `:id` in URL                                         | Retrieve details for a single ticket |
| `POST` | `/api/tickets`         | `{ title, description, customerEmail, priority }`    | Create a new support ticket (Status defaults to `Open`) |
| `PATCH`| `/api/tickets/:id`     | `{ status?, priority? }`                             | Update ticket status and/or priority |

---

## Technical Choices & Architectural Decisions

- **Decoupled Architecture**: Frontend and backend are separated into distinct modules with their own package lifecycles, enabling independent deployment, testing, and scaling.
- **Dual-Layer Validation**:
  - **Zod schemas** on the server catch schema violations early and format clear, per-field validation error messages.
  - **Mongoose schemas** enforce database-level validation, enum constraints, and indexing as a resilient safety net.
  - The client mirrors these constraints for instant feedback while handling server errors seamlessly.
- **Database-Level Query Optimization**: Filtering, sorting, and pagination are executed entirely in the database engine via MongoDB (`find()`, `skip()`, `limit()`, `countDocuments()`).
- **High-Performance Aggregation**: The dashboard metrics summary uses a single `$group` aggregation pipeline, ensuring O(1) database trips decoupled from active UI list filters.
- **Synchronized URL State**: Search terms, active status filters, priority filters, and pagination state sync to URL search parameters, making dashboard views bookmarkable and resilient to page refreshes.
- **In-Memory Testing Harness**: Backend integration tests run against `mongodb-memory-server`, ensuring zero flakiness and zero side-effects on production or development databases.

---

## Assumptions & Scope

- **Authentication**: Authentication was considered out of scope for this module; all users access the system as support agents.
- **Editable Fields**: Per specification, only `status` and `priority` are editable after ticket creation. Ticket title, description, and original customer contact email remain immutable records.
- **Email Normalization**: Customer emails are automatically trimmed and normalized to lowercase to maintain consistent indexing and search.

---

## Known Limitations & Future Enhancements

- **Text Search Scaling**: Search currently uses regex matching (`$or` across title and email). For large datasets exceeding millions of documents, this should be upgraded to MongoDB Atlas Search or compound text indexes.
- **Cursor-Based Pagination**: The current pagination uses `skip()`/`limit()`. For deeply paginated large collections, migrating to cursor-based (`_id` or timestamp) pagination will optimize performance.
- **Role-Based Access Control (RBAC)**: Future iterations can introduce JWT authentication to differentiate between customer submissions and agent ticket management.

---

## Time Spent

- Architecture, Schema Design & Backend Implementation: ~1.5 hours
- Automated Integration Tests & Error Handling: ~0.75 hours
- Frontend State Management, Filtering & Component UI: ~1.5 hours
- Cross-Platform Testing, Seed Verification & Documentation: ~0.5 hours
- **Total Time**: ~4.25 hours

---

## Screenshots

Screenshots demonstrating core user flows can be found in [`docs/screenshots/`](docs/screenshots/):

1. **Dashboard & Ticket List**: Summary metrics counters, active filters, search, and paginated records.
2. **Create Ticket Modal**: Form with input validation and customer email formatting.
3. **Ticket Detail & Status Management**: Viewing ticket details and modifying status/priority.
