# Team Task Manager (Full-Stack)

Full-stack web app to manage projects, members, tasks, and progress with role-based access (Admin/Member).

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt
- Deployment: Railway

## Features
- Signup/Login authentication
- Project creation and team member management
- Task creation, assignment, and status updates
- Role-based access control:
  - Admin: manage members and tasks
  - Member: view project data and update assigned task status
- Dashboard metrics:
  - Total tasks
  - Todo / In Progress / Done
  - Overdue tasks

## API Endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /projects`
- `GET /projects`
- `GET /projects/:id`
- `POST /projects/:id/members`
- `DELETE /projects/:id/members/:userId`
- `POST /projects/:id/tasks`
- `GET /projects/:id/tasks`
- `PATCH /tasks/:id`
- `GET /dashboard`

## Local Setup
1. Clone repo and install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Configure env files:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
3. Setup PostgreSQL and Prisma:
   - Ensure PostgreSQL is running locally and create DB `team_task_manager`
   - `cd backend`
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Run apps:
   - Backend: `npm run dev` (port 5000)
   - Frontend: `npm run dev` (port 5173)

## Railway Deployment
Deploy as two services:

1. **Backend service**
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm run start`
   - Required variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `PORT`
     - `NODE_ENV=production`
     - `CORS_ORIGIN=<frontend_railway_url>`

2. **Frontend service**
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - Required variables:
     - `VITE_API_URL=<backend_railway_url>`

## Submission Checklist
- Live URL
- GitHub repo link
- `README.txt`
- 2-5 minute demo video

