export type UserRole = 'ADMIN' | 'MANAGER' | 'ANNOTATOR' | 'REVIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  accuracyRate?: number;
  completedTasksCount?: number;
  activeWorkload?: number;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
