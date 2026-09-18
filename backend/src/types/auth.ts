export const ROLE_CODES = ['SUPER_ADMIN','ADMIN','GURU','SANTRI'] as const;
export type RoleCode = typeof ROLE_CODES[number];

export interface AuthPrincipal {
  userId: number;
  username: string;
  role: RoleCode;
  permissions: string[];
  teacherId?: number;
  studentId?: number;
  mustChangePassword: boolean;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPrincipal;
    }
  }
}
export {};
