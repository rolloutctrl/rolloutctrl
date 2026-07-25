import type { Project } from '@/entities/Project';
import type { User } from '@/entities/User';

export type Organization = {
  id: string;
  name: string;
  description?: string;

  url?: string;

  users: User[];
  projects: Project[];

  totalUsers?: number;
  totalProjects?: number;

  createdAt: Date;
  updatedAt: Date;
};

