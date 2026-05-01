# TaskFlow — Team Task Manager

A full-stack collaborative task management app with role-based access control, Kanban boards, and real-time project dashboards.

---

## Features

- **Authentication** — Signup / Login with JWT & bcrypt password hashing
- **Project Management** — Create projects and invite team members via email
- **Task Board** — Kanban-style board with Todo / In Progress / Done columns
- **Task Details** — Priority levels (Low / Medium / High), due dates, assignments, and comments
- **Role-Based Access Control**
- **Admin** — Full control: manage members, create/edit/delete tasks
- **Member** — View project data and update status of assigned tasks
- **Dashboard** — Metrics: total tasks, status breakdown, and overdue tasks at a glance
- **Security** — Helmet, CORS, rate limiting, and input validation with Zod

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, TypeScript, React Router, Axios |
| Backend    | Node.js, Express 5, TypeScript                  |
| Database   | PostgreSQL, Prisma ORM                          |
| Auth       | JWT, bcryptjs                                   |
| Validation | Zod                                             |
| Deployment | Railway                                         |

---

## Project Structure

```
TaskFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── migrations/         # Migration history
│   └── src/
│       ├── middleware/         # Auth, project access, validation
│       ├── routes/             # auth, projects, tasks, dashboard
│       ├── utils/              # Mailer, token helpers
│       └── index.ts            # Entry point
└── frontend/
    └── src/
        ├── components/         # TaskModal, Sidebar, UI primitives
        ├── hooks/              # useAuth, useToast
        ├── pages/              # Auth, Dashboard, Board, Projects, Profile
        ├── api.ts              # Axios instance
        └── types.ts            # Shared TypeScript types
```

---

## Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL running locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**`backend/.env`** — fill in your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="your_strong_secret_here"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
APP_BASE_URL="http://localhost:5173"
```

**`frontend/.env`**:

```env
VITE_API_URL="http://localhost:5000"
```

### 4. Set Up the Database

Make sure PostgreSQL is running, then:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the App

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| POST   | /auth/signup   | Register a new user |
| POST   | /auth/login    | Login & get JWT    |
| GET    | /auth/me       | Get current user   |

### Projects
| Method | Endpoint                          | Description                   |
|--------|-----------------------------------|-------------------------------|
| POST   | /projects                         | Create a project              |
| GET    | /projects                         | List all user projects        |
| GET    | /projects/:id                     | Get project details           |
| POST   | /projects/:id/members             | Add/invite a member           |
| DELETE | /projects/:id/members/:userId     | Remove a member               |

### Tasks
| Method | Endpoint             | Description             |
|--------|----------------------|-------------------------|
| POST   | /projects/:id/tasks  | Create a task           |
| GET    | /projects/:id/tasks  | List project tasks      |
| PATCH  | /tasks/:id           | Update task             |

### Dashboard
| Method | Endpoint    | Description             |
|--------|-------------|-------------------------|
| GET    | /dashboard  | Get task metrics        |

---

## 🗄️ Database Schema Overview

- **User** — Authentication & profile
- **Project** — Team workspace
- **ProjectMember** — User↔Project join with role (admin/member)
- **Task** — Title, description, status, priority, due date, assignee
- **Comment** — Threaded task comments

---

## Deploying to Railway

Deploy as **two separate Railway services** from the same GitHub repo.

### Backend Service

| Setting        | Value                                                   |
|----------------|---------------------------------------------------------|
| Root Directory | `backend`                                               |
| Build Command  | `npm install && npx prisma generate && npm run build`   |
| Start Command  | `npm run start`                                         |

**Environment Variables:**
```
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=<strong secret>
PORT=<provided by Railway>
NODE_ENV=production
CORS_ORIGIN=<your frontend Railway URL>
```

### Frontend Service

| Setting        | Value                                          |
|----------------|------------------------------------------------|
| Root Directory | `frontend`                                     |
| Build Command  | `npm install && npm run build`                 |
| Start Command  | `npm run preview -- --host 0.0.0.0 --port $PORT` |

**Environment Variables:**
```
VITE_API_URL=<your backend Railway URL>
```

> **Tip:** Add a Railway PostgreSQL plugin to your backend service and copy the `DATABASE_URL` it provides.

---

## License

MIT — feel free to use, modify, and distribute.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.
