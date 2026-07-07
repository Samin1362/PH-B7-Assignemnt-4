import type { UserRole } from "../../../generated/prisma/enums";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};
