export interface Task {
  task_id: number;
  project_id: number;
  name: string;
  completed: boolean;
  created_at: Date;
}

export default Task;
