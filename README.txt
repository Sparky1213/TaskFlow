Team Task Manager (Full-Stack)

Overview
This project is a full-stack Team Task Manager where users can register, log in, create projects, add members, assign tasks, and track progress with role-based access control.

Implemented Features
1) Authentication (Signup/Login) using JWT.
2) Project and team management.
3) Task creation, assignment, and status tracking.
4) Dashboard with task counts and overdue count.
5) Role-based permissions:
   - Admin: manage members and tasks.
   - Member: access project data and update assigned task status.

Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Security: bcrypt password hashing, JWT auth, input validation with Zod

Important API Endpoints
- POST /auth/signup
- POST /auth/login
- GET /auth/me
- POST /projects
- GET /projects
- GET /projects/:id
- POST /projects/:id/members
- DELETE /projects/:id/members/:userId
- POST /projects/:id/tasks
- GET /projects/:id/tasks
- PATCH /tasks/:id
- GET /dashboard

Local Setup
1. Install dependencies:
   - backend: npm install
   - frontend: npm install
2. Create env files:
   - backend/.env from backend/.env.example
   - frontend/.env from frontend/.env.example
3. Setup database (PostgreSQL):
   - Start PostgreSQL locally and create database: team_task_manager
   - npx prisma generate
   - npx prisma migrate dev --name init
4. Start apps:
   - backend: npm run dev
   - frontend: npm run dev

Environment Variables
Backend:
- DATABASE_URL
- JWT_SECRET
- PORT
- NODE_ENV
- CORS_ORIGIN

Frontend:
- VITE_API_URL

Demo Credentials (create after deploy)
- Admin Email:
- Admin Password:
- Member Email:
- Member Password:

Links
- Live Application URL: <add-your-railway-frontend-url>
- GitHub Repository Link: <add-your-github-repo-link>
- Backend URL: <add-your-railway-backend-url>

Demo Video Plan (2-5 minutes)
1. Show signup/login.
2. Show admin creating a project.
3. Show adding member to project.
4. Show creating and assigning tasks.
5. Show member updating task status.
6. Show dashboard counts including overdue.
7. Show Railway live links and GitHub repo.
