# ER Diagram

## Database Schema

This diagram shows the database tables and their relationships for the TaskFlow system.

## Diagram

```mermaid
erDiagram
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ PROJECT : "manages"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ ACTIVITY_LOG : "performs"
    USER }o--o{ PROJECT : "member of"
    
    PROJECT ||--o{ TASK : "contains"
    
    TASK ||--o{ COMMENT : "has"
    TASK ||--o{ ATTACHMENT : "has"
    TASK ||--o{ ACTIVITY_LOG : "tracks"
    TASK }o--o| TASK : "depends on"
    
    USER {
        varchar(36) id PK "UUID"
        varchar(255) email UK "Unique email"
        varchar(255) password "Hashed password"
        varchar(100) name
        enum role "ADMIN, MANAGER, TEAM_MEMBER"
        boolean is_active "Default true"
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECT {
        varchar(36) id PK "UUID"
        varchar(200) name
        text description
        varchar(36) manager_id FK "References USER"
        enum status "PLANNING, ACTIVE, COMPLETED, ARCHIVED"
        date deadline
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECT_MEMBERS {
        varchar(36) project_id FK "References PROJECT"
        varchar(36) user_id FK "References USER"
        timestamp created_at
        timestamp updated_at
    }
    
    TASK {
        varchar(36) id PK "UUID"
        varchar(200) title
        text description
        varchar(36) project_id FK "References PROJECT"
        varchar(36) assignee_id FK "References USER"
        varchar(36) created_by FK "References USER"
        enum status "TODO, IN_PROGRESS, IN_REVIEW, DONE"
        enum priority "LOW, MEDIUM, HIGH, URGENT"
        date due_date
        varchar(36) depends_on FK "References TASK (nullable)"
        timestamp created_at
        timestamp updated_at
    }
    
    COMMENT {
        varchar(36) id PK "UUID"
        varchar(36) task_id FK "References TASK"
        varchar(36) user_id FK "References USER"
        text content
        json mentions "Array of user IDs mentioned"
        timestamp created_at
        timestamp updated_at
    }
    
    ATTACHMENT {
        varchar(36) id PK "UUID"
        varchar(36) task_id FK "References TASK"
        varchar(36) uploaded_by FK "References USER"
        varchar(255) file_name
        varchar(500) file_path
        varchar(100) file_type
        bigint file_size "Size in bytes"
        timestamp created_at
    }
    
    NOTIFICATION {
        varchar(36) id PK "UUID"
        varchar(36) user_id FK "References USER"
        enum type "TASK_ASSIGNED, STATUS_CHANGED, COMMENT_ADDED, DEADLINE_APPROACHING, MENTION"
        varchar(500) message
        boolean is_read "Default false"
        varchar(36) related_entity_id "Task/Project/Comment ID"
        varchar(50) related_entity_type "TASK, PROJECT, COMMENT"
        timestamp created_at
        timestamp read_at
    }
    
    ACTIVITY_LOG {
        varchar(36) id PK "UUID"
        varchar(36) entity_id "Task/Project/User ID"
        varchar(50) entity_type "TASK, PROJECT, USER"
        varchar(36) user_id FK "References USER"
        varchar(100) action "CREATED, UPDATED, DELETED, STATUS_CHANGED, etc"
        json changes "Before/after values"
        varchar(45) ip_address
        timestamp created_at
    }
```

## Tables

### USER Table
Purpose: Stores user account information and authentication details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | User's full name |
| role | ENUM | NOT NULL | ADMIN, MANAGER, TEAM_MEMBER |
| isActive | BOOLEAN | DEFAULT TRUE | Account status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

### PROJECT Table
Purpose: Stores project information and metadata

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| name | VARCHAR(200) | NOT NULL | Project name |
| description | TEXT | NULL | Project description |
| managerId | VARCHAR(36) | FOREIGN KEY | Project manager |
| status | ENUM | DEFAULT 'PLANNING' | Project status |
| deadline | DATE | NULL | Project deadline |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

### PROJECT_MEMBERS Table
Purpose: Maps users to projects (many-to-many relationship)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| projectId | VARCHAR(36) | FOREIGN KEY, PRIMARY KEY | Project reference |
| userId | VARCHAR(36) | FOREIGN KEY, PRIMARY KEY | User reference |
| createdAt | TIMESTAMP | DEFAULT NOW() | Join time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

### TASK Table
Purpose: Stores task details and assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NULL | Detailed description |
| projectId | VARCHAR(36) | FOREIGN KEY | Parent project |
| assigneeId | VARCHAR(36) | FOREIGN KEY | Assigned user |
| createdBy | VARCHAR(36) | FOREIGN KEY | Task creator |
| status | ENUM | DEFAULT 'TODO' | Current status |
| priority | ENUM | DEFAULT 'MEDIUM' | Task priority |
| dueDate | DATE | NULL | Deadline |
| dependsOn | VARCHAR(36) | FOREIGN KEY, NULL | Task dependency |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

### COMMENT Table
Purpose: Stores task comments and discussions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| taskId | VARCHAR(36) | FOREIGN KEY | Parent task |
| userId | VARCHAR(36) | FOREIGN KEY | Comment author |
| content | TEXT | NOT NULL | Comment text |
| mentions | JSON | NULL | Mentioned user IDs |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation time |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update time |

### ATTACHMENT Table
Purpose: Stores file attachments for tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| taskId | VARCHAR(36) | FOREIGN KEY | Parent task |
| uploadedBy | VARCHAR(36) | FOREIGN KEY | Uploader user |
| fileName | VARCHAR(255) | NOT NULL | Original file name |
| filePath | VARCHAR(500) | NOT NULL | Storage path |
| fileType | VARCHAR(100) | NOT NULL | MIME type |
| fileSize | BIGINT | NOT NULL | Size in bytes |
| createdAt | TIMESTAMP | DEFAULT NOW() | Upload time |

### NOTIFICATION Table
Purpose: Stores user notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| userId | VARCHAR(36) | FOREIGN KEY | Recipient user |
| type | ENUM | NOT NULL | Notification type |
| message | VARCHAR(500) | NOT NULL | Notification message |
| isRead | BOOLEAN | DEFAULT FALSE | Read status |
| relatedEntityId | VARCHAR(36) | NULL | Related entity ID |
| relatedEntityType | VARCHAR(50) | NULL | Entity type (TASK, PROJECT, COMMENT) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation time |
| readAt | TIMESTAMP | NULL | Read timestamp |

### ACTIVITY_LOG Table
Purpose: Stores audit trail of all system changes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| entityId | VARCHAR(36) | NOT NULL | Entity being modified |
| entityType | VARCHAR(50) | NOT NULL | Type of entity |
| userId | VARCHAR(36) | FOREIGN KEY | User performing action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| changes | JSON | NULL | Before/after values |
| ipAddress | VARCHAR(45) | NULL | IP address of requester |
| createdAt | TIMESTAMP | DEFAULT NOW() | Action time |

## Relationships

### One-to-Many
- USER to TASK: One user can be assigned to many tasks
- USER to PROJECT: One user (manager) can manage many projects
- USER to COMMENT: One user can write many comments
- PROJECT to TASK: One project contains many tasks
- TASK to COMMENT: One task can have many comments
- TASK to ATTACHMENT: One task can have many attachments

### Many-to-Many
- USER to PROJECT (through PROJECT_MEMBERS): Users can be members of multiple projects

### Self-Referencing
- TASK to TASK: Tasks can depend on other tasks

## Indexes

- user_email_idx on USER(email): Fast login lookups
- task_assignee_idx on TASK(assigneeId): Quick task queries
- task_project_idx on TASK(projectId): Fast project task retrieval
- task_status_idx on TASK(status): Filter by status
- notification_user_read_idx on NOTIFICATION(userId, isRead): Unread notifications
- comment_task_idx on COMMENT(taskId): Get task comments
- activity_log_entity_idx on ACTIVITY_LOG(entityId, entityType): Audit trail queries

## Constraints

### Foreign Keys
- PROJECT.managerId references USER.id ON DELETE SET NULL
- TASK.projectId references PROJECT.id ON DELETE CASCADE
- TASK.assigneeId references USER.id ON DELETE SET NULL
- TASK.createdBy references USER.id ON DELETE SET NULL
- COMMENT.taskId references TASK.id ON DELETE CASCADE
- COMMENT.userId references USER.id ON DELETE SET NULL
- ATTACHMENT.taskId references TASK.id ON DELETE CASCADE
- ATTACHMENT.uploadedBy references USER.id ON DELETE SET NULL
- NOTIFICATION.userId references USER.id ON DELETE CASCADE
- ACTIVITY_LOG.userId references USER.id ON DELETE SET NULL

### Unique Constraints
- USER.email: Each email must be unique
- PROJECT_MEMBERS(projectId, userId): User can't be added to same project twice

## Data Types

### Enums
- USER.role: ADMIN, MANAGER, TEAM_MEMBER
- PROJECT.status: PLANNING, ACTIVE, COMPLETED, ARCHIVED
- TASK.status: TODO, IN_PROGRESS, IN_REVIEW, DONE
- TASK.priority: LOW, MEDIUM, HIGH, URGENT
- NOTIFICATION.type: TASK_ASSIGNED, STATUS_CHANGED, COMMENT_ADDED, DEADLINE_APPROACHING, MENTION

## Scalability Considerations

- UUID primary keys for distributed systems
- Proper indexing for frequently queried columns
- Cascade delete for maintaining referential integrity
- JSON columns for flexible data storage
- Timestamp tracking for audit purposes
- Activity logs for complete audit trail
