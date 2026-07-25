import type { Project } from "@/entities/Project";
import type { Strategy } from "@/entities/Strategy";
import type { Operator } from "@/shared/types/enums";
import type { Nullable } from "@/shared/types/types";

export type Segment = {
  id: string;

  projectId: string;

  key: string;
  name: string;
  description: Nullable<string>;

  project: Project;
  rules: SegmentRule[];
  strategies: Strategy[];
  
  createdAt: Date;
  updatedAt: Date;
};

export type SegmentRule = {
  id: string;

  segmentId: string;

  field: string;
  operator: Operator;
  value: string;
  priority: number;
  not?: boolean;

  segment: Segment;

  createdAt: Date;
  updatedAt: Date;
};
