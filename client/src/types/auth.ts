// client/src/types/auth.ts
export type UserRole = "student" | "faculty" | "admin" | "supervisor" | "ST" | "RA" | "TA";

export interface RegisterData {
  name: string;
  universityId: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: UserRole;
  department: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  universityId: string;
  roles: string[];
  department: string;
  profile?: {
    department: string;
  };
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface FormErrors {
  name?: string;
  universityId?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roles?: string;
  department?: string;
  general?: string;
}
