# Team Task Manager

A premium full-stack application for managing team projects and tasks with role-based access control.

## Tech Stack
- **Frontend**: ReactJS, Vite, Axios, React Router, Context API, Framer Motion, Lucide React.
- **Backend**: Python, Django, Django REST Framework, JWT Authentication.
- **Database**: SQLite (Dev), PostgreSQL (Production).

## Features
- **Authentication**: JWT-based Signup/Login/Logout.
- **Roles**:
  - **Admin**: Create projects, manage members, create and assign tasks.
  - **Member**: View assigned tasks, update task status.
- **Project Management**: CRUD operations for projects (Admin only).
- **Task Management**: Create, assign, delete (Admin) and update status (Member).
- **Dashboard**: Real-time stats on total, completed, pending, and overdue tasks.
- **Responsive UI**: Modern glassmorphic design with smooth animations.

## Installation Steps

### Backend Setup
1. Navigate to `backend/`
2. Create virtual environment: `python -m venv venv`
3. Activate venv: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Start server: `python manage.py runserver`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## API Endpoints
- `POST /api/register/` - User registration
- `POST /api/login/` - User login (returns JWT + user info)
- `POST /api/token/refresh/` - Refresh JWT
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project (Admin)
- `GET /api/tasks/` - List tasks (Member sees assigned only)
- `GET /api/tasks/dashboard/` - Dashboard statistics

## Deployment
- **Backend**: Optimized for Railway (Procfile, runtime.txt included).
- **Frontend**: Optimized for Vercel/Netlify.
