import { SQLiteDatabase } from 'expo-sqlite';

// Function to populate database with extensive sample data (2 months)
export async function populateDatabase(db: SQLiteDatabase) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2); // Start 2 months ago
  
  try {
    // Clear existing data first
    await clearDatabase(db);
    
    // Project 1: Web Development
    const project1Result = await db.runAsync(
      "INSERT INTO projects (name, hourly_cost, created_at) VALUES (?, ?, ?);",
      "E-commerce Website Development",
      75.50,
      startDate.toISOString()
    );
    const project1Id = project1Result.lastInsertRowId;

    // Project 2: Mobile App
    const project2Date = new Date(startDate);
    project2Date.setDate(startDate.getDate() + 15);
    const project2Result = await db.runAsync(
      "INSERT INTO projects (name, hourly_cost, created_at) VALUES (?, ?, ?);",
      "Task Management Mobile App",
      85.00,
      project2Date.toISOString()
    );
    const project2Id = project2Result.lastInsertRowId;

    // Tasks for Project 1
    const project1Tasks = [
      { name: "UI/UX Design", completed: 1 },
      { name: "Frontend Development", completed: 1 },
      { name: "Backend API Development", completed: 1 },
      { name: "Database Design", completed: 1 },
      { name: "Payment Integration", completed: 0 },
      { name: "Testing & Bug Fixes", completed: 0 },
      { name: "Deployment & DevOps", completed: 0 },
      { name: "Performance Optimization", completed: 0 }
    ];

    // Tasks for Project 2
    const project2Tasks = [
      { name: "Market Research", completed: 1 },
      { name: "Wireframing", completed: 1 },
      { name: "React Native Setup", completed: 1 },
      { name: "Authentication System", completed: 1 },
      { name: "Task CRUD Operations", completed: 0 },
      { name: "Push Notifications", completed: 0 },
      { name: "Offline Sync", completed: 0 },
      { name: "App Store Submission", completed: 0 }
    ];

    const taskIds: number[] = [];

    // Insert tasks for Project 1
    for (let i = 0; i < project1Tasks.length; i++) {
      const task = project1Tasks[i];
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (i * 3)); // Spread tasks over time
      
      const taskResult = await db.runAsync(
        "INSERT INTO tasks (project_id, name, completed, created_at) VALUES (?, ?, ?, ?);",
        project1Id,
        task.name,
        task.completed,
        taskDate.toISOString()
      );
      taskIds.push(taskResult.lastInsertRowId!);
    }

    // Insert tasks for Project 2
    for (let i = 0; i < project2Tasks.length; i++) {
      const task = project2Tasks[i];
      const taskDate = new Date(project2Date);
      taskDate.setDate(project2Date.getDate() + (i * 4)); // Spread tasks over time
      
      const taskResult = await db.runAsync(
        "INSERT INTO tasks (project_id, name, completed, created_at) VALUES (?, ?, ?, ?);",
        project2Id,
        task.name,
        task.completed,
        taskDate.toISOString()
      );
      taskIds.push(taskResult.lastInsertRowId!);
    }

    // Generate extensive time tracking data
    const currentDate = new Date();
    const totalDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let day = 0; day < totalDays; day++) {
      const workDate = new Date(startDate);
      workDate.setDate(startDate.getDate() + day);
      
      // Skip weekends (randomly work some weekends)
      const isWeekend = workDate.getDay() === 0 || workDate.getDay() === 6;
      if (isWeekend && Math.random() > 0.3) continue;

      // Randomly select 1-4 tasks to work on each day
      const numTasksToday = Math.floor(Math.random() * 4) + 1;
      const shuffledTaskIds = [...taskIds].sort(() => Math.random() - 0.5);
      const todayTasks = shuffledTaskIds.slice(0, numTasksToday);

      for (const taskId of todayTasks) {
        // Generate 1-5 time entries per task per day
        const numEntries = Math.floor(Math.random() * 5) + 1;
        
        for (let entry = 0; entry < numEntries; entry++) {
          // Random time between 15 minutes (900 seconds) and 4 hours (14400 seconds)
          const timeInSeconds = Math.floor(Math.random() * 13500) + 900;
          
          // Random time during the day
          const entryTime = new Date(workDate);
          entryTime.setHours(8 + Math.floor(Math.random() * 10)); // Between 8 AM and 6 PM
          entryTime.setMinutes(Math.floor(Math.random() * 60));
          entryTime.setSeconds(Math.floor(Math.random() * 60));
          
          await db.runAsync(
            "INSERT INTO timings (task_id, time, created_at) VALUES (?, ?, ?);",
            taskId,
            timeInSeconds,
            entryTime.toISOString()
          );
        }
      }
    }

    console.log('Database populated successfully with 2 months of data!');
  } catch (error) {
    console.error('Error populating database:', error);
    throw error;
  }
}

// Function to clear all database data
export async function clearDatabase(db: SQLiteDatabase) {
  try {
    // Delete in correct order due to foreign key constraints
    await db.runAsync("DELETE FROM timings;");
    await db.runAsync("DELETE FROM tasks;");
    await db.runAsync("DELETE FROM projects;");
    
    // Reset auto-increment counters
    await db.runAsync("DELETE FROM sqlite_sequence WHERE name IN ('projects', 'tasks', 'timings');");
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// Function to get database statistics
export async function getDatabaseStats(db: SQLiteDatabase) {
  try {
    const projectCount = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM projects;");
    const taskCount = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM tasks;");
    const timingCount = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM timings;");
    
    return {
      projects: projectCount?.count || 0,
      tasks: taskCount?.count || 0,
      timings: timingCount?.count || 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { projects: 0, tasks: 0, timings: 0 };
  }
}