export interface Task {
  task_id: number;
  project_id: number;
  name: string;
  completed: 0 | 1;
  created_at: Date;
}

export default Task;
