import type { Strategy, StrategyRule } from '@/entities/Strategy';

export type IssueSeverity = 'error' | 'warning' | 'info';

export type ValidationIssue = {
  severity: IssueSeverity;
  code: string;
  message: string;
};

type NormalizedRule = {
  field: string;
  operator: string;
  value: string;
};

const normalizeValue = (value: unknown): string => {
  if (Array.isArray(value)) return (value as unknown[]).map(String).sort().join(',');
  return String(value ?? '').toLowerCase().trim();
};

const normalizeRules = (rules: StrategyRule[]): NormalizedRule[] =>
  rules.map((r) => ({
    field: r.field.toLowerCase().trim(),
    operator: r.operator,
    value: normalizeValue(r.value as unknown),
  }));

/**
 * Returns true if every rule in `subset` is also present in `superset`.
 * Vacuously true for empty subset — meaning a strategy with no rules is
 * less restrictive than any strategy with rules.
 */
const isRuleSubset = (subset: NormalizedRule[], superset: NormalizedRule[]): boolean =>
  subset.every((sub) =>
    superset.some(
      (sup) =>
        sup.field === sub.field &&
        sup.operator === sub.operator &&
        sup.value === sub.value,
    ),
  );

const getStrategyLabel = (strategy: Strategy, sortedIndex: number): string => {
  const name = strategy.name ? `"${strategy.name}"` : `#${sortedIndex + 1}`;
  return `Strategy ${name} (priority ${strategy.priority})`;
};

export const validateStrategies = (flagEnabled: boolean, strategies: Strategy[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  // --- WARNING: No strategies ---
  if (strategies.length === 0 && !flagEnabled) {
    issues.push({
      severity: 'info',
      code: 'NO_STRATEGIES',
      message:
        'No strategies configured.',
    });
    return issues;
  }

  if (strategies.length === 0 && flagEnabled) {
    issues.push({
      severity: 'info',
      code: 'NO_STRATEGIES',
      message:
        'No strategies configured. The flag will use its default enabled/disabled state for this environment.',
    });
    return issues;
  }

  // Sort descending by priority (highest priority evaluated first)
  const sorted = [...strategies].sort((a, b) => b.priority - a.priority);

  for (let i = 0; i < sorted.length; i++) {
    const strategy = sorted[i];
    const label = getStrategyLabel(strategy, i);

    
    // --- ERROR: Rollout out of valid range ---
    if (
      strategy.rolloutPercentage !== null &&
      strategy.rolloutPercentage !== undefined &&
      (strategy.rolloutPercentage < 0 || strategy.rolloutPercentage > 100)
    ) {
      issues.push({
        severity: 'error',
        code: 'INVALID_ROLLOUT',
        message: `${label} — rollout percentage ${strategy.rolloutPercentage}% is outside the valid range (0–100).`,
      });
    }

    // --- WARNING: Rollout = 0 (dead strategy) ---
    if (strategy.rolloutPercentage === 0) {
      issues.push({
        severity: 'warning',
        code: 'ROLLOUT_ZERO',
        message: `${label} — rollout is set to 0%. This strategy will never match any request.`,
      });
      // No point checking unreachability for a strategy that can never match
      continue;
    }

    // --- WARNING: Rollout = 100 ---
    // Skip for isDefault strategies — 100% rollout is expected for a fallback
    if (strategy.rolloutPercentage === 100 && !strategy.isDefault) {
      issues.push({
        severity: 'warning',
        code: 'ROLLOUT_FULL',
        message: `${label} — rollout is at 100%. Consider removing the rollout percentage constraint entirely.`,
      });
    }

    // --- WARNING: No conditions (catch-all) ---
    const rolloutUnconstrained =
      strategy.rolloutPercentage === null ||
      strategy.rolloutPercentage === undefined ||
      strategy.rolloutPercentage === 100;

    // Skip for isDefault strategies — being a catch-all is the intended behavior
    if (
      !strategy.isDefault &&
      strategy.rules.length === 0 &&
      (!strategy.segments || strategy.segments.length === 0) &&
      rolloutUnconstrained
    ) {
      issues.push({
        severity: 'warning',
        code: 'NO_CONDITIONS',
        message: `${label} — has no rules, no segments, and no rollout limit. It matches all requests and shadows every lower-priority strategy.`,
      });
    }

    // --- ERROR: Unreachable strategy ---
    // A lower-priority strategy B is unreachable if a higher-priority strategy A
    // has a rule set that is a subset of B's rule set (A is less restrictive → always fires first).
    // Skip for isDefault strategies — they are meant to be the fallback and may appear "unreachable"
    if (i > 0 && !strategy.isDefault) {
      const currentNormRules = normalizeRules(strategy.rules);

      for (let j = 0; j < i; j++) {
        const higher = sorted[j];

        // Skip disabled strategies (rollout = 0)
        if (higher.rolloutPercentage === 0) continue;

        const higherNormRules = normalizeRules(higher.rules);

        // Segment compatibility:
        // - If higher has no segments → less restrictive, can shadow anything
        // - If higher has any overlapping segments with current → compatible
        // - Otherwise (no overlapping segments) → cannot determine statically
        const segmentCompatible =
          !higher.segments ||
          higher.segments.length === 0 ||
          !strategy.segments ||
          strategy.segments.length === 0 ||
          higher.segments.some((hs) =>
            strategy.segments.some((cs) => hs.id === cs.id),
          );

        if (!segmentCompatible) continue;

        // If higher.rules ⊆ current.rules, higher always fires when current would
        if (isRuleSubset(higherNormRules, currentNormRules)) {
          const higherLabel = getStrategyLabel(higher, j);
          issues.push({
            severity: 'error',
            code: 'UNREACHABLE_STRATEGY',
            message: `${label} is unreachable — ${higherLabel} has a less restrictive condition set and will always match first.`,
          });
          break;
        }
      }
    }
  }

  return issues;
};
