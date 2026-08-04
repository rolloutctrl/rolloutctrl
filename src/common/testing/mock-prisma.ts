/**
 * Loosely-typed PrismaService mock. Each model delegate is a record of
 * `jest.Mock` functions, so `.mockResolvedValueOnce(...)` works without
 * fighting Prisma's complex generic method signatures.
 *
 * `$transaction(cb)` invokes the callback with the same mock, so
 * transactional code paths can be tested transparently.
 */
export type PrismaDelegateMock = Record<string, jest.Mock> & {
  aggregate: jest.Mock;
};

export interface MockPrismaService {
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  user: PrismaDelegateMock;
  session: PrismaDelegateMock;
  organization: PrismaDelegateMock;
  project: PrismaDelegateMock;
  environment: PrismaDelegateMock;
  featureFlag: PrismaDelegateMock;
  featureFlagEnvironment: PrismaDelegateMock;
  strategy: PrismaDelegateMock;
  strategyRule: PrismaDelegateMock;
  strategyVariant: PrismaDelegateMock;
  segment: PrismaDelegateMock;
  segmentRule: PrismaDelegateMock;
  variant: PrismaDelegateMock;
  action: PrismaDelegateMock;
  actionStrategy: PrismaDelegateMock;
  apiKey: PrismaDelegateMock;
  auditLog: PrismaDelegateMock;
  notification: PrismaDelegateMock;
  metric: PrismaDelegateMock;
  projectMember: PrismaDelegateMock;
}

const MODEL_NAMES = [
  'user',
  'session',
  'organization',
  'project',
  'environment',
  'featureFlag',
  'featureFlagEnvironment',
  'strategy',
  'strategyRule',
  'strategyVariant',
  'segment',
  'segmentRule',
  'variant',
  'action',
  'actionStrategy',
  'apiKey',
  'auditLog',
  'notification',
  'metric',
  'projectMember',
] as const;

const COMMON_DELEGATE_METHODS = [
  'findUnique',
  'findFirst',
  'findMany',
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

function createDelegateMock(): PrismaDelegateMock {
  const delegate: any = { aggregate: jest.fn() };
  for (const method of COMMON_DELEGATE_METHODS) {
    delegate[method] = jest.fn();
  }
  // Allow ad-hoc methods (e.g. `findFirstOrThrow`) without pre-declaring.
  return new Proxy(delegate, {
    get(target, prop: string) {
      if (!(prop in target)) {
        target[prop] = jest.fn();
      }
      return target[prop];
    },
  });
}

export function createMockPrismaService(): MockPrismaService {
  const mock: any = {
    $transaction: jest.fn(async (cbOrArray: any) => {
      if (typeof cbOrArray === 'function') {
        return cbOrArray(mock);
      }
      return Promise.all(cbOrArray);
    }),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  for (const model of MODEL_NAMES) {
    mock[model] = createDelegateMock();
  }

  return mock as MockPrismaService;
}
