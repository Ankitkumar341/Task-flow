export interface User {
  id?: number;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'TESTER';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  id?: number;
  username?: string;
  email?: string;
  role?: string;
}
