import dayjs from 'dayjs';

import type { AuditLog } from '../model/types';

const ACTION_VERB: Record<string, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  ENABLE: 'Enabled',
  DISABLE: 'Disabled',
  REVOKE: 'Revoked',
};

const RESOURCE_LABEL: Record<string, string> = {
  FLAG: 'flag',
  ACTION: 'action',
  STRATEGY: 'strategy',
  SEGMENT: 'segment',
  VARIANT: 'variant',
  STRATEGY_VARIANT: 'variant',
  ENVIRONMENT: 'environment',
  API_KEY: 'API key',
  PROJECT: 'project',
};

const CHANGE_FIELD_FORMATTER: Record<
  string,
  (change: { before: unknown; after: unknown }) => string
> = {
  rolloutPercentage: ({ before, after }) => `Rollout: ${before}% → ${after}%`,
  startsAt: ({ before, after }) =>
    `Starts at: ${before ? dayjs(before as Date).format('DD MMM YYYY HH:mm') : '—'} → ${after ? dayjs(after as Date).format('DD MMM YYYY HH:mm') : '—'}`,
  endsAt: ({ before, after }) =>
    `Ends at: ${before ? dayjs(before as Date).format('DD MMM YYYY HH:mm') : '—'} → ${after ? dayjs(after as Date).format('DD MMM YYYY HH:mm') : '—'}`,
};

function camelToLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();
}

export function formatAuditLogChanges(
  changes: Array<{ field: string; before: unknown; after: unknown }>,
): string | null {
  const parts: string[] = [];

  for (const change of changes) {
    if (change.field === 'enabled') continue;

    const formatter = CHANGE_FIELD_FORMATTER[change.field];
    if (formatter) {
      parts.push(formatter(change));
      continue;
    }

    parts.push(
      `${camelToLabel(change.field)}: ${String(change.before)} → ${String(change.after)}`,
    );
  }

  return parts.length ? parts.join(', ') : null;
}

export const buildAuditLogCaption = (log: AuditLog): string => {
  const meta = log.metadata;

  const verb = ACTION_VERB[log.action] ?? log.action;
  const typeLabel =
    RESOURCE_LABEL[log.resourceType] ?? log.resourceType.toLowerCase();

  // Special handling for STRATEGY_VARIANT resource type
  if (log.resourceType === 'STRATEGY_VARIANT') {
    const strategyName = meta?.strategy?.name;
    const preposition = log.action === 'DELETE' ? 'from' : 'in';
    let caption = `${verb} variant ${preposition} "${strategyName}" strategy`;

    if (meta?.environment?.name) {
      caption += ` in ${meta.environment.name}`;
    }

    if (meta?.reason) {
      caption += ` — ${meta.reason}`;
    }

    return caption;
  }

  const resourceName =
    log.resourceName ??
    meta?.strategy?.name ??
    meta?.variant?.name ??
    meta?.segment?.name ??
    meta?.action?.name ??
    null;

  const nameOrId =
    resourceName && resourceName !== log.resourceId
      ? `${resourceName || log.resourceId}`
      : log.resourceId;

  let caption = `${verb} ${typeLabel} ${nameOrId}`;

  if (meta?.environment?.name) {
    caption += ` in ${meta.environment.name}`;
  }

  if (meta?.reason) {
    caption += ` — ${meta.reason}`;
  }

  return caption;
};
