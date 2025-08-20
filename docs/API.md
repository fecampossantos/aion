# API Documentation

## Database Schema & Data Models

Aion uses SQLite for local data persistence with three main entities: Projects, Tasks, and Timings.

## Data Models

### Project Interface

```typescript
interface Project {
  project_id: number;    // Primary key, auto-increment
  name: string;          // Project name, required
  hourly_cost: number;   // Cost per hour in currency units
  created_at: Date;      // Timestamp of creation
}
```

**Usage Example:**
```typescript
const project: Project = {
  project_id: 1,
  name: "Mobile App Development",
  hourly_cost: 75.00,
  created_at: new Date("2024-01-15T10:30:00Z")
};
```

### Task Interface

```typescript
interface Task {
  task_id: number;       // Primary key, auto-increment
  project_id: number;    // Foreign key to projects table
  name: string;          // Task name, required
  completed: 0 | 1;      // Boolean as integer (0 = false, 1 = true)
  created_at: Date;      // Timestamp of creation
}
```

**Usage Example:**
```typescript
const task: Task = {
  task_id: 1,
  project_id: 1,
  name: "Design user interface",
  completed: 0,
  created_at: new Date("2024-01-15T11:00:00Z")
};
```

### Timing Interface

```typescript
interface Timing {
  timing_id: number;     // Primary key, auto-increment
  task_id: number;       // Foreign key to tasks table
  time: number;          // Time tracked in seconds
  created_at: string;    // ISO string timestamp
}
```

**Usage Example:**
```typescript
const timing: Timing = {
  timing_id: 1,
  task_id: 1,
  time: 3600,  // 1 hour in seconds
  created_at: "2024-01-15T11:00:00.000Z"
};
```

## Database Operations

### Projects

#### Create Project
```sql
INSERT INTO projects (name, hourly_cost) VALUES (?, ?);
```

#### Get All Projects
```sql
SELECT * FROM projects;
```

#### Get Project by ID
```sql
SELECT * FROM projects WHERE project_id = ?;
```

#### Update Project
```sql
UPDATE projects SET name = ?, hourly_cost = ? WHERE project_id = ?;
```

#### Delete Project
```sql
DELETE FROM projects WHERE project_id = ?;
```

### Tasks

#### Create Task
```sql
INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);
```

#### Get Tasks by Project
```sql
SELECT * FROM tasks WHERE project_id = ?;
```

#### Update Task Completion
```sql
UPDATE tasks SET completed = ? WHERE task_id = ?;
```

#### Delete Task
```sql
DELETE FROM tasks WHERE task_id = ?;
```

### Timings

#### Create Timing Entry
```sql
INSERT INTO timings (task_id, time) VALUES (?, ?);
```

#### Get Timings by Task
```sql
SELECT * FROM timings WHERE task_id = ?;
```

#### Get Timings by Date Range
```sql
SELECT 
  tk.completed as task_completed,
  tk.name as task_name,
  ti.created_at as timing_created_at,
  ti.time as timing_timed
FROM tasks tk
LEFT JOIN timings ti ON tk.task_id = ti.task_id
WHERE tk.project_id = ? AND ti.created_at BETWEEN ? AND ?
ORDER BY ti.created_at;
```

## Data Relationships

### Entity Relationship Diagram

```
Projects (1) ──── (many) Tasks (1) ──── (many) Timings
   │                        │                    │
   ├─ project_id (PK)      ├─ task_id (PK)     ├─ timing_id (PK)
   ├─ name                 ├─ project_id (FK)   ├─ task_id (FK)
   ├─ hourly_cost          ├─ name              ├─ time
   └─ created_at           ├─ completed         └─ created_at
                           └─ created_at
```

### Cascade Behavior

- **Delete Project**: Automatically deletes all associated tasks and their timings
- **Delete Task**: Automatically deletes all associated timing entries
- **Foreign Key Constraints**: Ensure data integrity across relationships

## Database Migration

The app includes a migration system in `app/_layout.tsx`:

```typescript
async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  
  if (currentDbVersion === 0) {
    // Initial schema creation
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      
      CREATE TABLE IF NOT EXISTS projects (
        project_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        hourly_cost REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        name TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS timings (
        timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        time INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
      );
    `);
    
    // Insert sample data
    await db.runAsync(
      "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
      "projeto exemplo",
      10
    );
  }
  
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
```

## Database Configuration

### WAL Mode
The database uses Write-Ahead Logging (WAL) mode for better performance:
```sql
PRAGMA journal_mode = 'wal';
```

### Performance Considerations

1. **Indexing**: Consider adding indexes for frequently queried columns:
   ```sql
   CREATE INDEX idx_tasks_project_id ON tasks(project_id);
   CREATE INDEX idx_timings_task_id ON timings(task_id);
   CREATE INDEX idx_timings_created_at ON timings(created_at);
   ```

2. **Batch Operations**: Use transactions for multiple operations:
   ```typescript
   await db.withTransactionAsync(async () => {
     await db.runAsync("INSERT INTO ...", params1);
     await db.runAsync("INSERT INTO ...", params2);
   });
   ```

## Data Validation

### Client-side Validation

```typescript
// Project validation
const validateProject = (name: string, hourlyCost: string): string | null => {
  if (!name.trim()) {
    return "Project name cannot be empty";
  }
  
  if (parseFloat(hourlyCost) < 0) {
    return "Hourly cost must be positive";
  }
  
  return null;
};

// Task validation
const validateTask = (name: string): string | null => {
  if (!name.trim()) {
    return "Task name cannot be empty";
  }
  
  return null;
};
```

### Unique Constraints

The app enforces unique project names through application logic:

```typescript
const existingProject = await database.getFirstAsync(
  "SELECT * FROM projects WHERE name = ?;",
  projectName
);

if (existingProject) {
  setErrorMessage("A project with this name already exists");
  return;
}
```

## Time Calculation

### Converting Seconds to Time Format

```typescript
const secondsToHHMMSS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds };
};

const secondsToTimeHHMMSS = (totalSeconds: number): string => {
  const { hours, minutes, seconds } = secondsToHHMMSS(totalSeconds);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
```

### Cost Calculation

```typescript
const calculateTotalCost = (timeInSeconds: number, hourlyRate: number): number => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  
  const hoursCost = hours * hourlyRate;
  const minutesCost = minutes * (hourlyRate / 60);
  const secondsCost = seconds * (hourlyRate / 3600);
  
  return hoursCost + minutesCost + secondsCost;
};
```

## Error Handling

### Database Error Handling

```typescript
try {
  const result = await database.runAsync(
    "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
    projectName,
    parseFloat(cost)
  );
  console.log("Project created with ID:", result.lastInsertRowId);
} catch (error) {
  console.error("Database error:", error);
  setErrorMessage("Failed to create project. Please try again.");
}
```

### Common Error Patterns

1. **Constraint Violations**: Handle foreign key and unique constraint errors
2. **Network Issues**: Handle database connection issues gracefully
3. **Data Type Mismatches**: Validate data types before database operations
4. **Transaction Rollbacks**: Implement proper error recovery

## Best Practices

1. **Use Prepared Statements**: Always use parameterized queries to prevent SQL injection
2. **Handle Async Operations**: Properly handle Promise rejections
3. **Validate Input**: Validate all user input before database operations
4. **Use Transactions**: Group related operations in transactions
5. **Index Wisely**: Add indexes for frequently queried columns
6. **Monitor Performance**: Use SQLite EXPLAIN QUERY PLAN for optimization