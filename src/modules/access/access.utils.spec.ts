import { MatchType, Operator } from 'src/common/generated/prisma/enums';
import {
  evaluateRule,
  evaluateStrategyRules,
  getNestedValue,
  isRolloutMatch,
  isScheduleActive,
  OPERATOR_EVALUATORS,
} from './access.utils';

describe('access.utils', () => {
  describe('getNestedValue', () => {
    it('walks dotted paths', () => {
      expect(getNestedValue({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(1);
    });

    it('returns undefined for missing keys', () => {
      expect(getNestedValue({ a: 1 }, 'b.c')).toBeUndefined();
    });

    it('returns undefined for empty path', () => {
      expect(getNestedValue({ a: 1 }, '')).toBeUndefined();
    });
  });

  describe('OPERATOR_EVALUATORS', () => {
    it.each([
      [Operator.EQUALS, 5, 5, true],
      [Operator.EQUALS, 5, '5', false],
      [Operator.IN, 2, [1, 2, 3], true],
      [Operator.IN, 9, [1, 2, 3], false],
      [Operator.IN, 2, 'not-array', false],
      [Operator.GT, 5, 3, true],
      [Operator.GT, 3, 5, false],
      [Operator.GT, '5', 3, false],
      [Operator.LT, 3, 5, true],
      [Operator.GTE, 5, 5, true],
      [Operator.LTE, 5, 5, true],
      [Operator.CONTAINS, 'hello world', 'world', true],
      [Operator.CONTAINS, 'hello', 'world', false],
      [Operator.CONTAINS, 123, '1', false],
      [Operator.STARTS_WITH, 'hello', 'he', true],
      [Operator.ENDS_WITH, 'hello', 'lo', true],
      [Operator.INCLUDES, [1, 2, 3], 2, true],
      [Operator.INCLUDES, 'hello', 'ell', true],
      [Operator.INCLUDES, 5, 5, false],
    ])('%s(%p, %p) -> %p', (op, a, b, expected) => {
      expect(OPERATOR_EVALUATORS[op](a, b as never)).toBe(expected);
    });
  });

  describe('evaluateRule', () => {
    it('evaluates a matching rule', () => {
      expect(
        evaluateRule(
          { field: 'country', operator: Operator.EQUALS, value: 'US' },
          { country: 'US' },
        ),
      ).toBe(true);
    });

    it('negates with `not`', () => {
      expect(
        evaluateRule(
          {
            field: 'country',
            operator: Operator.EQUALS,
            value: 'US',
            not: true,
          },
          { country: 'RU' },
        ),
      ).toBe(true);
    });

    it('parses JSON array value strings', () => {
      expect(
        evaluateRule(
          {
            field: 'tags',
            operator: Operator.IN,
            value: '["a","b"]' as never,
          },
          { tags: 'b' },
        ),
      ).toBe(true);
    });

    it('returns false for unknown operator', () => {
      expect(
        evaluateRule(
          { field: 'x', operator: 'NOPE' as Operator, value: 1 },
          { x: 1 },
        ),
      ).toBe(false);
    });

    it('walks nested field paths', () => {
      expect(
        evaluateRule(
          { field: 'user.age', operator: Operator.GTE, value: 18 },
          { user: { age: 21 } },
        ),
      ).toBe(true);
    });
  });

  describe('evaluateStrategyRules', () => {
    const rules = [
      { field: 'a', operator: Operator.EQUALS, value: 1 },
      { field: 'b', operator: Operator.EQUALS, value: 2 },
    ];

    it('returns true for empty rules', () => {
      expect(evaluateStrategyRules([], MatchType.ALL, {})).toBe(true);
    });

    it('ALL requires every rule to match', () => {
      expect(evaluateStrategyRules(rules, MatchType.ALL, { a: 1, b: 2 })).toBe(
        true,
      );
      expect(evaluateStrategyRules(rules, MatchType.ALL, { a: 1, b: 9 })).toBe(
        false,
      );
    });

    it('ANY requires at least one rule to match', () => {
      expect(evaluateStrategyRules(rules, MatchType.ANY, { a: 1, b: 9 })).toBe(
        true,
      );
      expect(evaluateStrategyRules(rules, MatchType.ANY, { a: 9, b: 9 })).toBe(
        false,
      );
    });
  });

  describe('isScheduleActive', () => {
    it('active when between startsAt and endsAt', () => {
      const past = new Date(Date.now() - 1000).toISOString();
      const future = new Date(Date.now() + 1000).toISOString();
      expect(isScheduleActive(past, future)).toBe(true);
    });

    it('inactive before startsAt', () => {
      const future = new Date(Date.now() + 10000).toISOString();
      expect(isScheduleActive(future, null)).toBe(false);
    });

    it('inactive after endsAt', () => {
      const past = new Date(Date.now() - 10000).toISOString();
      expect(isScheduleActive(null, past)).toBe(false);
    });

    it('active when no schedule set', () => {
      expect(isScheduleActive(null, undefined)).toBe(true);
    });
  });

  describe('isRolloutMatch', () => {
    it('returns false when stickiness value missing', () => {
      expect(
        isRolloutMatch(50, 'custom', { userId: undefined }, undefined, 'flag'),
      ).toBe(false);
    });

    it('falls back to userId when no stickiness field', () => {
      // Deterministic for a given userId + flagKey; just assert it returns a boolean
      const result = isRolloutMatch(100, null, {}, 'user-1', 'flag');
      expect(result).toBe(true); // 100% rollout always matches
    });

    it('0% rollout never matches', () => {
      expect(isRolloutMatch(0, null, {}, 'user-1', 'flag')).toBe(false);
    });

    it('reads stickiness from attributes path', () => {
      const result = isRolloutMatch(
        100,
        'user.email',
        { user: { email: 'a@b.com' } },
        undefined,
        'flag',
      );
      expect(result).toBe(true);
    });
  });
});
