# Sequence Diagram

## Main Flow: Task Assignment and Status Update

This diagram shows the end-to-end flow when a manager assigns a task to a team member and the team member updates its status.

## Diagram - Task Assignment Flow

```mermaid
sequenceDiagram
    actor Manager
    participant Frontend
    participant AuthMiddleware
    participant TaskController
    participant TaskService
    participant PermissionService
    participant TaskRepository
    participant NotificationService
    participant Database
    participant EmailService
    
    Manager->>Frontend: Click "Assign Task"
    Frontend->>Frontend: Fill task form (title, description, assignee)
    Frontend->>TaskController: POST /api/tasks (with JWT token)
    TaskController->>AuthMiddleware: Validate JWT token
    AuthMiddleware-->>TaskController: User authenticated
    
    TaskController->>TaskService: createTask(taskData, managerId)
    TaskService->>PermissionService: checkPermission(managerId, "CREATE_TASK")
    PermissionService-->>TaskService: Permission granted
    
    TaskService->>TaskService: Validate task data
    TaskService->>TaskRepository: save(task)
    TaskRepository->>Database: INSERT INTO tasks
    Database-->>TaskRepository: Task created (ID: 123)
    TaskRepository-->>TaskService: Task object
    
    TaskService->>NotificationService: notifyTaskAssignment(task)
    NotificationService->>Database: INSERT INTO notifications
    NotificationService->>EmailService: sendEmail(assignee, taskDetails)
    EmailService-->>NotificationService: Email sent
    
    TaskService->>TaskRepository: logActivity(taskId, "TASK_CREATED")
    TaskRepository->>Database: INSERT INTO activity_logs
    
    TaskService-->>TaskController: Task created successfully
    TaskController-->>Frontend: 201 Created (task data)
    Frontend-->>Manager: Display success message
```

## Diagram - Task Status Update Flow

```mermaid
sequenceDiagram
    actor TeamMember
    participant Frontend
    participant AuthMiddleware
    participant TaskController
    participant TaskService
    participant PermissionService
    participant TaskRepository
    participant NotificationService
    participant Database
    
    TeamMember->>Frontend: Change task status to "In Progress"
    Frontend->>TaskController: PATCH /api/tasks/123/status (JWT + status)
    TaskController->>AuthMiddleware: Validate JWT token
    AuthMiddleware-->>TaskController: User authenticated
    
    TaskController->>TaskService: updateTaskStatus(taskId, newStatus, userId)
    TaskService->>TaskRepository: findById(taskId)
    TaskRepository->>Database: SELECT * FROM tasks WHERE id=123
    Database-->>TaskRepository: Task data
    TaskRepository-->>TaskService: Task object
    
    TaskService->>PermissionService: canUpdateTask(userId, task)
    PermissionService->>PermissionService: Check if user is assignee or manager
    PermissionService-->>TaskService: Permission granted
    
    TaskService->>TaskService: Validate status transition
    TaskService->>TaskRepository: update(taskId, {status: "IN_PROGRESS"})
    TaskRepository->>Database: UPDATE tasks SET status='IN_PROGRESS'
    Database-->>TaskRepository: Updated
    
    TaskService->>TaskRepository: logActivity(taskId, "STATUS_CHANGED")
    TaskRepository->>Database: INSERT INTO activity_logs
    
    TaskService->>NotificationService: notifyStatusChange(task, manager)
    NotificationService->>Database: INSERT INTO notifications
    
    TaskService-->>TaskController: Status updated
    TaskController-->>Frontend: 200 OK (updated task)
    Frontend-->>TeamMember: Show updated status
```

## Flow Description

### Task Assignment Flow

#### Step 1: Manager Initiates Task Creation
Manager fills out a form with task details including title, description, priority, deadline, and selects a team member to assign.

#### Step 2: Frontend Processing
Frontend validates form data, attaches JWT token from localStorage, and sends POST request to backend API.

#### Step 3: Authentication Middleware
AuthMiddleware intercepts the request, validates JWT token, extracts user information, and attaches it to the request object.

#### Step 4: Controller Layer
TaskController receives the request, extracts task data and user info, and delegates to TaskService for business logic processing.

#### Step 5: Permission Validation
PermissionService checks if the user has the required role (Manager or Admin) to create and assign tasks.

#### Step 6: Service Layer - Business Logic
TaskService validates task data (required fields, valid dates, assignee exists), applies business rules, and prepares data for persistence.

#### Step 7: Repository Layer - Data Persistence
TaskRepository uses ORM to insert task data into the database, handling the SQL query generation and execution.

#### Step 8: Notification System
NotificationService creates a notification record and triggers EmailService to send an email to the assigned team member.

#### Step 9: Activity Logging
System logs the task creation activity with timestamp, user, and action details for audit trail.

#### Step 10: Response Flow
Success response travels back through the layers, and frontend displays confirmation to the manager.

### Task Status Update Flow

#### Step 1: Team Member Updates Status
Team member clicks on status dropdown and selects new status (To Do → In Progress → Done).

#### Step 2: Permission Check
System verifies that the user is either the assignee or has manager/admin privileges.

#### Step 3: Status Validation
Service layer validates that the status transition is valid (e.g., can't go from To Do directly to Done).

#### Step 4: Database Update
Repository updates the task status and logs the activity.

#### Step 5: Manager Notification
System notifies the project manager about the status change.

## Alternative Flows

### Error Handling - Unauthorized Access
```mermaid
sequenceDiagram
    participant Frontend
    participant TaskController
    participant PermissionService
    
    Frontend->>TaskController: Request with invalid token
    TaskController->>PermissionService: Validate permission
    PermissionService->>PermissionService: Permission denied
    PermissionService-->>TaskController: 403 Forbidden
    TaskController-->>Frontend: Error: Unauthorized
    Frontend-->>Frontend: Redirect to login
```

### Error Handling - Validation Failure
```mermaid
sequenceDiagram
    participant TaskController
    participant TaskService
    participant Frontend
    
    TaskController->>TaskService: createTask(invalidData)
    TaskService->>TaskService: Validate data
    TaskService->>TaskService: Validation fails (missing required field)
    TaskService-->>TaskController: ValidationException
    TaskController-->>Frontend: 400 Bad Request (error details)
    Frontend-->>Frontend: Display validation errors
```

### Error Handling - Database Failure
```mermaid
sequenceDiagram
    participant TaskService
    participant TaskRepository
    participant Database
    participant TaskController
    
    TaskService->>TaskRepository: save(task)
    TaskRepository->>Database: INSERT query
    Database-->>TaskRepository: Connection timeout
    TaskRepository-->>TaskService: DatabaseException
    TaskService-->>TaskController: 500 Internal Server Error
    TaskController-->>TaskController: Log error
    TaskController-->>Frontend: Generic error message
```
