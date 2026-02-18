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
        varchar(36) id PK "UUID"
        varchar(36) project_id FK "References PROJECT"
        varchar(36) user_id FK "References USER"
        timestamp joined_at
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
**Purpose**: Stores user account information and authentication details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | User's full name |
| role | ENUM | NOT NULL | ADMIN, MANAGER, TEAM_MEMBER |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### PROJECT Table
**Purpose**: Stores project information and metadata

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| name | VARCHAR(200) | NOT NULL | Project name |
| description | TEXT | NULL | Project description |
| manager_id | VARCHAR(36) | FOREIGN KEY | Project manager |
| status | ENUM | DEFAULT 'PLANNING' | Project status |
| deadline | DATE | NULL | Project deadline |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### TASK Table
**Purpose**: Stores task details and assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NULL | Detailed description |
| project_id | VARCHAR(36) | FOREIGN KEY | Parent project |
| assignee_id | VARCHAR(36) | FOREIGN KEY | Assigned user |
| created_by | VARCHAR(36) | FOREIGN KEY | Task creator |
| status | ENUM | DEFAULT 'TODO' | Current status |
| priority | ENUM | DEFAULT 'MEDIUM' | Task priority |
| due_date | DATE | NULL | Deadline |
| depends_on | VARCHAR(36) | FOREIGN KEY, NULL | Task dependency |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

## Relationships

### One-to-Many
- USER to TASK: One user can be assigned to many tasks
- USER to PROJECT: One user (manager) can manage many projects
- PROJECT to TASK: One project contains many tasks
- TASK to COMMENT: One task can have many comments

### Many-to-Many
- USER to PROJECT (through PROJECT_MEMBERS): Users can be members of multiple projects

### Self-Referencing
- TASK to TASK: Tasks can depend on other tasks

## Indexes

- user_email_idx on USER(email): Fast login lookups
- task_assignee_idx on TASK(assignee_id): Quick task queries
- task_project_idx on TASK(project_id): Fast project task retrieval
- notification_user_read_idx on NOTIFICATION(user_id, is_read): Unread notifications

## Constraints

### Foreign Keys
- PROJECT.manager_id references USER.id ON DELETE SET NULL
- TASK.project_id references PROJECT.id ON DELETE CASCADE
- TASK.assignee_id references USER.id ON DELETE SET NULL
- COMMENT.task_id references TASK.id ON DELETE CASCADE
- NOTIFICATION.user_id references USER.id ON DELETE CASCADE

### Unique Constraints
- USER.email: Each email must be unique
- PROJECT_MEMBERS(project_id, user_id): User can't be added to same project twice
