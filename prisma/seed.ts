import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  OrganizationRole,
  Operator,
  TeamRole,
  ActionEffect,
  MatchType,
  AuthProvider,
} from 'src/common/generated/prisma/enums';
import { PrismaClient } from 'src/common/generated/prisma/client';

import { createAvatar } from '@dicebear/core';
import * as shapes from '@dicebear/shapes';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding...');

  const saltRounds = parseInt(process.env.USER_PASSWORD_SALT_ROUNDS || '5');
  if (Number.isNaN(saltRounds))
    throw new Error('USER_PASSWORD_SALT_ROUNDS parameter must be an integer!');

  const email = 'admin@rolloutctrl.local';

  const passwordHash = await bcrypt.hash('@Rollout123', saltRounds);

  const avatar = createAvatar(shapes, {
    seed: email,
  });
  const avatarSvg = avatar.toDataUri();

  // 1. Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'My Organization',
    },
  });

  console.log('✅ Organization created');

  // 2. Owner user
  const owner = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      avatar: avatarSvg,
      name: 'Owner',
      organizationRole: OrganizationRole.OWNER,
      organizationId: organization.id,
      joinedAt: new Date(),
    },
  });

  // 2a. User identity
  await prisma.userIdentity.create({
    data: {
      userId: owner.id,
      provider: AuthProvider.LOCAL,
      providerUserId: owner.id,
      providerEmail: email,
    },
  });

  console.log('✅ Owner user created');

  // 3. Project
  const project = await prisma.project.create({
    data: {
      name: 'Main Project',
      slug: 'main-project',
      description: 'Main project for testing',
      organizationId: organization.id,
    },
  });

  console.log('✅ Project created');

  // 4. Project member
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: owner.id,
      role: TeamRole.OWNER,
    },
  });

  console.log('✅ Project member created');

  // 5. Project environments
  const [devEnv, prodEnv] = await Promise.all([
    prisma.environment.create({
      data: { name: 'development', projectId: project.id, isSystem: true },
    }),
    prisma.environment.create({
      data: { name: 'production', projectId: project.id, isSystem: true },
    }),
  ]);

  console.log('✅ Environments created');

  // 7. Feature flags
  const newDashboardFlag = await prisma.featureFlag.create({
    data: {
      projectId: project.id,
      key: 'new-dashboard',
      description: 'Enable new dashboard rollout',
      archived: false,
      createdByEmail: owner.email,
      createdById: owner.id,
      createdByName: owner.name,
    },
  });

  console.log('✅ Feature flag created');

  // 8. FeatureFlagEnvironment configurations
  // Enable new_dashboard for all environments with different rules
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [devFFEnv, prodFFEnv] = await Promise.all([
    prisma.featureFlagEnvironment.create({
      data: {
        featureFlagId: newDashboardFlag.id,
        environmentId: devEnv.id,
        enabled: false,
      },
    }),
    prisma.featureFlagEnvironment.create({
      data: {
        featureFlagId: newDashboardFlag.id,
        environmentId: prodEnv.id,
        enabled: false,
      },
    }),
  ]);

  console.log('✅ Feature flag environments configured');

  // 9. Segments
  const testUsersSegment = await prisma.segment.create({
    data: {
      projectId: project.id,
      key: 'test-users',
      name: 'Test Users',
      description: 'Users with test email addresses',
    },
  });

  console.log('✅ Segments created');

  // 10. Segment rules
  await prisma.segmentRule.create({
    data: {
      segmentId: testUsersSegment.id,
      field: 'email',
      operator: Operator.CONTAINS,
      value: '@test.com',
      priority: 0,
    },
  });

  console.log('✅ Segment rules created');

  // 11. Strategies
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prodStrategyWithSegment, prodStrategy] = await Promise.all([
    // Prod strategy: target test users segment
    prisma.strategy.create({
      data: {
        featureFlagEnvironmentId: prodFFEnv.id,
        name: 'Test Users Strategy',
        rolloutPercentage: null,
        priority: 0,
      },
    }),
    // Prod strategy: 25% rollout with additional targeting
    prisma.strategy.create({
      data: {
        featureFlagEnvironmentId: prodFFEnv.id,
        name: 'Gradual Rollout',
        rolloutPercentage: 25,
        rolloutStickinessField: 'userId',
        priority: 1,
      },
    }),
  ]);

  await prisma.segment.update({
    where: {
      id: testUsersSegment.id,
    },
    data: {
      strategies: {
        connect: [
          {
            id: prodStrategyWithSegment.id,
          },
        ],
      },
    },
  });

  console.log('✅ Strategies created');

  // 12. Strategy rules for production Gradual Rollout
  await Promise.all([
    // Only for premium users
    prisma.strategyRule.create({
      data: {
        strategyId: prodStrategy.id,
        field: 'subscription',
        operator: Operator.EQUALS,
        value: 'premium',
      },
    }),
    // Only for users from specific countries
    prisma.strategyRule.create({
      data: {
        strategyId: prodStrategy.id,
        field: 'country',
        operator: Operator.IN,
        value: JSON.stringify(['US', 'CA', 'GB']),
      },
    }),
    // Exclude beta testers
    prisma.strategyRule.create({
      data: {
        strategyId: prodStrategy.id,
        field: 'betaTester',
        operator: Operator.EQUALS,
        not: true,
        value: 'true',
      },
    }),
  ]);

  console.log('✅ Strategy rules created');

  // 13. Action
  const editUserAction = await prisma.action.create({
    data: {
      projectId: project.id,
      key: 'user.edit',
      description: 'Edit user',
      defaultEffect: ActionEffect.DENY,
    },
  });

  // 14. Action strategy for admin and manager roles
  await prisma.actionStrategy.create({
    data: {
      actionId: editUserAction.id,

      effect: ActionEffect.ALLOW,

      matchType: MatchType.ANY,

      rules: {
        create: [
          {
            field: 'role',
            operator: Operator.IN,
            value: JSON.stringify(['admin', 'mamager']),
          },
        ],
      },
    },
  });

  console.log('✅ Action rules created');

  console.log('\n============================');
  console.log('🎉 Seed completed');
  console.log('============================\n');

  console.log('Owner credentials:');
  console.log(`Email: ${email}`);
  console.log('Password: @Rollout123');
  console.log('\n============================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
