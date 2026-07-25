import { MatchType, Operator } from 'src/common/generated/prisma/enums';
import * as crypto from 'crypto';
import { EvaluateRuleInput, OperatorEvaluator } from './access.types';
import { RuleValue } from 'src/common/types/common';

export const OPERATOR_EVALUATORS: Record<Operator, OperatorEvaluator> = {
  [Operator.EQUALS]: (a, b) => a === b,

  [Operator.IN]: (a, b) => Array.isArray(b) && b.includes(a as never),

  [Operator.INCLUDES]: (a, b) =>
    Array.isArray(a)
      ? a.includes(b as never)
      : typeof a === 'string' && typeof b === 'string'
        ? a.includes(b)
        : false,

  [Operator.GT]: (a, b) =>
    typeof a === 'number' && typeof b === 'number' && a > b,

  [Operator.LT]: (a, b) =>
    typeof a === 'number' && typeof b === 'number' && a < b,

  [Operator.GTE]: (a, b) =>
    typeof a === 'number' && typeof b === 'number' && a >= b,

  [Operator.LTE]: (a, b) =>
    typeof a === 'number' && typeof b === 'number' && a <= b,

  [Operator.CONTAINS]: (a, b) =>
    typeof a === 'string' && typeof b === 'string' && a.includes(b),

  [Operator.STARTS_WITH]: (a, b) =>
    typeof a === 'string' && typeof b === 'string' && a.startsWith(b),

  [Operator.ENDS_WITH]: (a, b) =>
    typeof a === 'string' && typeof b === 'string' && a.endsWith(b),
};

function normalizeRuleValue(value: RuleValue): RuleValue {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // keep as-is
      }
    }
  }
  return value;
}

export function evaluateRule(rule: EvaluateRuleInput, input: unknown): boolean {
  const { field, operator, value, not = false } = rule;

  const actualValue = getNestedValue(input, field);

  const evaluator = OPERATOR_EVALUATORS[operator];

  if (!evaluator) {
    return false;
  }

  const result = evaluator(actualValue, normalizeRuleValue(value));

  return not ? !result : result;
}

export function getNestedValue(input: Record<string, any>, path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], input);
}

export function isScheduleActive(
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined,
): boolean {
  const now = new Date();
  if (startsAt && new Date(startsAt) > now) return false;
  if (endsAt && new Date(endsAt) < now) return false;
  return true;
}

export function isRolloutMatch(
  rolloutPercentage: number,
  rolloutStickinessField: string | null | undefined,
  attributes: Record<string, any> | undefined,
  userId: string | undefined,
  flagKey: string,
): boolean {
  const context = { ...(attributes ?? {}), userId };
  const stickinessValue = rolloutStickinessField
    ? getNestedValue(context, rolloutStickinessField)
    : userId;

  if (stickinessValue === undefined || stickinessValue === null) return false;

  const hash = crypto
    .createHash('sha256')
    .update(`${flagKey}:${String(stickinessValue)}`)
    .digest('hex');

  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  return bucket < rolloutPercentage;
}

export function evaluateStrategyRules(
  rules: EvaluateRuleInput[],
  matchType: MatchType,
  context: unknown,
): boolean {
  if (rules.length === 0) return true;
  if (matchType === MatchType.ALL) {
    return rules.every((rule) => evaluateRule(rule, context));
  }
  return rules.some((rule) => evaluateRule(rule, context));
}
