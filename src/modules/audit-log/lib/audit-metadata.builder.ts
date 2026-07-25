export type AuditMetadataChangeEntry<T = unknown> = {
  field: string;
  before: T;
  after: T;
};

export type AuditMetadataPayload = {
  reason?: string;
  strategy?: { id: string; name?: string };
  environment?: { id: string; name?: string };
  flag?: { id: string; name?: string };
  changes?: AuditMetadataChangeEntry[];
  snapshot?: Record<string, unknown>;
  variant?: {
    id: string;
    name: string;
  };
  action?: {
    id: string;
    name: string;
  };
  segment?: {
    id: string;
    name: string;
  };
  source?: {
    type: 'UI' | 'API' | 'CLI' | 'SYSTEM' | 'MCP';
    name?: string;
  };
  [key: string]: unknown;
};

export class AuditMetadata {
  private readonly payload: AuditMetadataPayload = {};

  static build(): AuditMetadata {
    return new AuditMetadata();
  }

  withReason(reason: string): this {
    this.payload.reason = reason;
    return this;
  }

  withFlag(flag: { id: string; name?: string }): this {
    this.payload.flag = flag;
    return this;
  }

  withStrategy(strategy: { id: string; name?: string }): this {
    this.payload.strategy = strategy;
    return this;
  }

  withVariant(variant: { id: string; name: string }): this {
    this.payload.variant = variant;
    return this;
  }

  withAction(action: { id: string; name: string }): this {
    this.payload.action = action;
    return this;
  }

  withSegment(segment: { id: string; name: string }): this {
    this.payload.segment = segment;
    return this;
  }

  withEnvironment(environment: { id: string; name?: string }): this {
    this.payload.environment = environment;
    return this;
  }

  withChanges(changes: AuditMetadataChangeEntry[]): this {
    this.payload.changes = changes;
    return this;
  }

  withSource(source: {
    type: 'UI' | 'API' | 'CLI' | 'SYSTEM' | 'MCP';
    name?: string;
  }): this {
    this.payload.source = source;
    return this;
  }

  with(extra: Record<string, unknown>): this {
    Object.assign(this.payload, extra);
    return this;
  }

  toJSON(): AuditMetadataPayload {
    return { ...this.payload };
  }
}
