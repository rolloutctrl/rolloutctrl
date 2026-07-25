import type { Action } from "@/entities/Action";
import type { Segment } from "@/entities/Segment";
import type { ActionEffect, MatchType, Operator } from "@/shared/types/enums";

export type ActionStrategy = {
  id: string;
  actionId: string;
  priority: number;
  enabled: boolean;
  effect: ActionEffect;
  segmentId: string;
  matchType: MatchType;

  action: Action;

  rules: ActionStrategyRule[];
  segments: Segment[];

  createdAt: Date;
  updatedAt: Date;
}

export type ActionStrategyRule = {
  id: string;
  strategyId: string;
  field: string;
  operator: Operator;
  value: string;
  not: boolean;

  strategy: ActionStrategy;

  createdAt: Date;
  updatedAt: Date;
}
