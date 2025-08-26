import { SQLiteDatabase } from 'expo-sqlite';

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