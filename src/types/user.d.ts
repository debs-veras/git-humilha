export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  password?: string;
};

export type UpdateUserInput = Partial<CreateUserInput>;
