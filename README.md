# TaskFlow - Team Task Management System

A full-stack task management application demonstrating clean architecture, OOP principles, and design patterns. Built with Node.js, Express, PostgreSQL, React, and Redux.

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd taskflow
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Setup database
```bash
createdb taskflow_db
```

5. Configure environment variables
```bash
cd ../server
cp .env.example .env
# Edit .env with your database credentials
```

6. Start development servers

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

The application will be available at http://localhost:3000

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/unit/services/TaskService.test.js

# Run tests in watch mode
npm test -- --watch
```

## Test Coverage

The project includes comprehensive test coverage:

- Unit Tests: Services, Models, Middleware
- Integration Tests: API Endpoints, Authentication, Authorization
- Coverage Target: 70%+ across all metrics

Test Structure:
```
server/tests/
├── unit/
│   ├── services/          # Service layer tests
│   ├── models/            # Model tests
│   └── middleware/        # Middleware tests
├── integration/           # API integration tests
├── health.test.js         # Health check tests
└── setup.js              # Test configuration
```

## Architecture

### Backend Architecture
- Framework: Node.js with Express
- Database: PostgreSQL with Sequelize ORM
- Architecture Pattern: Layered (Controller → Service → Repository → Model)
- Authentication: JWT tokens with bcrypt password hashing

### Frontend Architecture
- Framework: React 18
- State Management: Redux Toolkit
- UI Library: Material-UI
- HTTP Client: Axios
- Routing: React Router v6

### Design Patterns Implemented
- Repository Pattern: Data access abstraction
- Service Layer Pattern: Business logic separation
- Strategy Pattern: Role-based permissions
- Observer Pattern: Notification system
- Factory Pattern: Object creation
- Singleton Pattern: Service instances
- Dependency Injection: Loose coupling

## Key Features

### User Management
- User registration with role selection (MANAGER, TEAM_MEMBER)
- JWT-based authentication
- Role-based access control (RBAC)
- User profile management
- Account activation/deactivation

### Project Management
- Create and manage projects
- Add team members to projects
- Project status tracking (PLANNING, ACTIVE, COMPLETED, ARCHIVED)
- Project analytics and statistics
- Deadline management

### Task Management
- Create, read, update, delete tasks
- Task status workflow (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- Task assignment and reassignment
- Task dependencies
- Due date tracking

### Collaboration Features
- Comment system on tasks
- File attachments for tasks
- Activity logging and audit trail
- Mention system for team members
- Real-time notifications

### Dashboard and Analytics
- User dashboard with task statistics
- Project overview and progress tracking
- Team performance metrics
- Task distribution by status and priority
- Overdue task alerts

## API Endpoints

### Authentication Endpoints
- POST /api/v1/users/register - User registration
- POST /api/v1/users/login - User login
- GET /api/v1/users/profile - Get user profile
- PUT /api/v1/users/profile - Update user profile

### User Endpoints
- GET /api/v1/users - Get all users (Admin/Manager only)
- GET /api/v1/users/:id - Get user by ID
- PUT /api/v1/users/:id - Update user (Admin only)
- DELETE /api/v1/users/:id/deactivate - Deactivate user (Admin only)

### Project Endpoints
- POST /api/v1/projects - Create project (Manager only)
- GET /api/v1/projects - Get all projects
- GET /api/v1/projects/my-projects - Get user's projects
- GET /api/v1/projects/:id - Get project by ID
- PUT /api/v1/projects/:id - Update project
- DELETE /api/v1/projects/:id - Delete project
- GET /api/v1/projects/:id/analytics - Get project analytics
- POST /api/v1/projects/:id/members - Add team member
- DELETE /api/v1/projects/:id/members/:userId - Remove team member

### Task Endpoints
- POST /api/v1/tasks - Create task
- GET /api/v1/tasks - Get all tasks
- GET /api/v1/tasks/my-tasks - Get user's assigned tasks
- GET /api/v1/tasks/:id - Get task by ID
- PUT /api/v1/tasks/:id - Update task
- PATCH /api/v1/tasks/:id/status - Update task status
- PATCH /api/v1/tasks/:id/assign - Assign task to user
- DELETE /api/v1/tasks/:id - Delete task
- GET /api/v1/tasks/project/:projectId - Get project tasks

### Comment Endpoints
- POST /api/v1/comments - Create comment
- GET /api/v1/comments/task/:taskId - Get task comments
- DELETE /api/v1/comments/:id - Delete comment

### Notification Endpoints
- GET /api/v1/notifications - Get user notifications
- PATCH /api/v1/notifications/:id/read - Mark notification as read
- PATCH /api/v1/notifications/read-all - Mark all notifications as read

### Dashboard Endpoints
- GET /api/v1/dashboard/user - Get user dashboard
- GET /api/v1/dashboard/team - Get team dashboard (Manager only)

### Attachment Endpoints
- POST /api/v1/attachments - Upload attachment
- GET /api/v1/attachments/task/:taskId - Get task attachments
- DELETE /api/v1/attachments/:id - Delete attachment

### Health Check
- GET /health - Server health status

## Role-Based Access Control

### ADMIN Role
- Full system access
- User management
- All project and task operations
- View all dashboards

### MANAGER Role
- Create and manage projects
- Add/remove team members
- Create and assign tasks
- View team dashboard
- Cannot delete other users

### TEAM_MEMBER Role
- View assigned projects
- View assigned tasks
- Update task status
- Add comments and attachments
- Cannot create projects
- Cannot delete projects or tasks

## Security Features

- JWT authentication with token expiration
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- Helmet security headers
- CORS protection
- Input validation and sanitization
- SQL injection prevention via Sequelize ORM
- Activity logging for audit trail

## Database Schema

The system uses PostgreSQL with the following main tables:

- users: User accounts and authentication
- projects: Project information
- project_members: Project membership mapping
- tasks: Task details and assignments
- comments: Task comments
- attachments: File attachments
- notifications: User notifications
- activity_logs: Audit trail

See docs/ErDiagram.md for detailed schema information.

## Tech Stack

### Backend
- Node.js v14+
- Express.js v4.18+
- PostgreSQL v12+
- Sequelize v6.35+
- JWT (jsonwebtoken v9.0+)
- bcryptjs v2.4+
- Winston v3.11+ (logging)
- Jest v29.7+ (testing)
- Supertest v6.3+ (API testing)

### Frontend
- React v18.2+
- Redux Toolkit v2.0+
- Material-UI v5.15+
- Axios v1.6+
- React Router v6.20+
- date-fns v3.0+
- react-toastify v9.1+

## Project Structure

```
taskflow/
├── server/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Sequelize models
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities and helpers
│   │   └── server.js        # Express app setup
│   ├── tests/               # Test files
│   ├── logs/                # Application logs
│   ├── .env.example         # Environment template
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   ├── store/           # Redux store
│   │   │   └── slices/      # Redux slices
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React entry point
│   ├── public/              # Static files
│   └── package.json
│
├── docs/                    # Documentation
├── README.md                # This file
└── .gitignore
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5001
API_VERSION=v1

DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development Workflow

1. Create a feature branch
2. Make changes to backend/frontend
3. Write tests for new features
4. Run tests to ensure all pass
5. Test API endpoints using curl or Postman
6. Commit changes with descriptive messages
7. Submit pull request for review

## Testing Endpoints with curl

### Register User
```bash
curl -X POST http://localhost:5001/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "MANAGER"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Project
```bash
curl -X POST http://localhost:5001/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description",
    "status": "ACTIVE",
    "deadline": "2026-12-31"
  }'
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in .env
- Verify database exists: createdb taskflow_db

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Set PORT environment variable before npm start

### Rate Limiting Issues
- Rate limiting is disabled in development mode
- For production, adjust RATE_LIMIT_MAX_REQUESTS in .env

### Authentication Errors
- Ensure JWT_SECRET is set in .env
- Check token expiration time
- Verify Authorization header format: Bearer <token>

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Authors

SESD Project - Milestone 1

## Support

For issues and questions, please create an issue in the repository.
