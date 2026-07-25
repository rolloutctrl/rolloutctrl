import type { Project } from "@/entities/Project";
import type { ActionEffect, MatchType, Operator } from "@/shared/types/enums";

export type ActionStrategyBasic = {
  id: string;
  actionId: string;
  name?: string;
  priority: number;
  enabled: boolean;
  effect: ActionEffect;
  segmentId?: string | null;
  matchType: MatchType;
  rules: {
    id: string;
    strategyId: string;
    field: string;
    operator: Operator;
    value: string;
    not: boolean;
  }[];
};

export type Action = {
  id: string;
  projectId: string;
  key: string;
  description?: string;
  enabled: boolean;
  defaultEffect: ActionEffect;

  project: Project;

  strategies: ActionStrategyBasic[];

  createdAt: Date;
  updatedAt: Date;
}
