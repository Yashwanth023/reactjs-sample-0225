
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Column {
  id: string;
  title: string;
  status: 'todo' | 'inProgress' | 'done';
  tasks: Task[];
}
