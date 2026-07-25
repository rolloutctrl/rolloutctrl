-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER');

-- CreateEnum
CREATE TYPE "VariantPayloadType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('FLAG_EXPOSURE', 'STRATEGY_MATCH', 'VARIANT_EXPOSURE');

-- CreateEnum
CREATE TYPE "SegmentMatchType" AS ENUM ('ANY', 'ALL');

-- CreateEnum
CREATE TYPE "ActionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('ALL', 'ANY');

-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('CLIENT', 'SERVER');

-- CreateEnum
CREATE TYPE "Operator" AS ENUM ('EQUALS', 'IN', 'INCLUDES', 'GT', 'LT', 'GTE', 'LTE', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SLACK', 'TELEGRAM', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INVITATION', 'APPROVAL', 'FEATURE_FLAG', 'ORGANIZATION', 'PROJECT', 'API_KEY', 'BILLING', 'SECURITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ENABLE', 'DISABLE', 'REVOKE', 'ORGANIZATION_CREATED', 'MEMBER_INVITED', 'MEMBER_JOINED', 'MEMBER_DECLINED', 'MEMBER_REMOVED', 'MEMBER_ROLE_CHANGED', 'OWNERSHIP_TRANSFERRED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('FLAG', 'ACTION', 'STRATEGY', 'SEGMENT', 'VARIANT', 'STRATEGY_VARIANT', 'ENVIRONMENT', 'API_KEY', 'PROJECT', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GITHUB');

-- CreateTable
CREATE TABLE "Organization" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "previewKey" TEXT NOT NULL,
    "environmentId" TEXT,
    "type" "ApiKeyType" NOT NULL,
    "allowedOrigins" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "organizationRole" "OrganizationRole" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "UserIdentity" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "providerUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIdentity_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,
    "deviceName" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Environment" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "approveRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "feature_flag_environments" (
    "_id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flag_environments_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "_id" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "featureFlagEnvironmentId" TEXT NOT NULL,
    "name" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rolloutPercentage" INTEGER,
    "rolloutStickinessField" TEXT,
    "timezone" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "matchType" "MatchType" NOT NULL DEFAULT 'ALL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "strategy_rules" (
    "_id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" "Operator" NOT NULL,
    "not" BOOLEAN NOT NULL DEFAULT false,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategy_rules_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "payloadType" "VariantPayloadType",
    "payload" JSONB,
    "colorTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "featureFlagId" TEXT NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "StrategyVariant" (
    "_id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "isCustomWeight" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyVariant_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "segments" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "segment_rules" (
    "_id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" "Operator" NOT NULL,
    "not" BOOLEAN NOT NULL DEFAULT false,
    "value" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segment_rules_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "actions" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultEffect" "ActionEffect" NOT NULL DEFAULT 'DENY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "action_strategies" (
    "_id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "effect" "ActionEffect" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "matchType" "MatchType" NOT NULL DEFAULT 'ALL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_strategies_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "action_strategy_rules" (
    "_id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" "Operator" NOT NULL,
    "value" JSONB NOT NULL,
    "not" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_strategy_rules_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ExposureEvent" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "featureFlagEnvironmentId" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "strategyId" TEXT,
    "variantId" TEXT,
    "contextKey" TEXT,
    "stickinessField" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExposureEvent_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "MetricsBucket" (
    "_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "featureFlagEnvironmentId" TEXT NOT NULL,
    "featureFlagId" TEXT,
    "strategyId" TEXT,
    "variantId" TEXT,
    "type" "MetricType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "bucketDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricsBucket_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "_id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "type" "NotificationType" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "actorUserId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "groupKey" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SegmentToStrategy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SegmentToStrategy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActionStrategyToSegment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActionStrategyToSegment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_organizationId_key" ON "Project"("slug", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_projectId_idx" ON "ApiKey"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserIdentity_userId_idx" ON "UserIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentity_provider_providerUserId_key" ON "UserIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Environment_projectId_idx" ON "Environment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_projectId_name_key" ON "Environment"("projectId", "name");

-- CreateIndex
CREATE INDEX "feature_flags_projectId_idx" ON "feature_flags"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_projectId_key_key" ON "feature_flags"("projectId", "key");

-- CreateIndex
CREATE INDEX "feature_flag_environments_featureFlagId_idx" ON "feature_flag_environments"("featureFlagId");

-- CreateIndex
CREATE INDEX "feature_flag_environments_environmentId_idx" ON "feature_flag_environments"("environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flag_environments_featureFlagId_environmentId_key" ON "feature_flag_environments"("featureFlagId", "environmentId");

-- CreateIndex
CREATE INDEX "strategies_featureFlagEnvironmentId_idx" ON "strategies"("featureFlagEnvironmentId");

-- CreateIndex
CREATE INDEX "strategy_rules_strategyId_idx" ON "strategy_rules"("strategyId");

-- CreateIndex
CREATE INDEX "Variant_featureFlagId_idx" ON "Variant"("featureFlagId");

-- CreateIndex
CREATE INDEX "StrategyVariant_strategyId_idx" ON "StrategyVariant"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyVariant_variantId_idx" ON "StrategyVariant"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyVariant_strategyId_variantId_key" ON "StrategyVariant"("strategyId", "variantId");

-- CreateIndex
CREATE INDEX "segments_projectId_idx" ON "segments"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "segments_projectId_key_key" ON "segments"("projectId", "key");

-- CreateIndex
CREATE INDEX "segment_rules_segmentId_idx" ON "segment_rules"("segmentId");

-- CreateIndex
CREATE INDEX "actions_projectId_idx" ON "actions"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "actions_projectId_key_key" ON "actions"("projectId", "key");

-- CreateIndex
CREATE INDEX "action_strategies_actionId_idx" ON "action_strategies"("actionId");

-- CreateIndex
CREATE INDEX "action_strategy_rules_strategyId_idx" ON "action_strategy_rules"("strategyId");

-- CreateIndex
CREATE INDEX "ExposureEvent_featureFlagId_createdAt_idx" ON "ExposureEvent"("featureFlagId", "createdAt");

-- CreateIndex
CREATE INDEX "ExposureEvent_variantId_createdAt_idx" ON "ExposureEvent"("variantId", "createdAt");

-- CreateIndex
CREATE INDEX "ExposureEvent_strategyId_createdAt_idx" ON "ExposureEvent"("strategyId", "createdAt");

-- CreateIndex
CREATE INDEX "ExposureEvent_featureFlagId_contextKey_idx" ON "ExposureEvent"("featureFlagId", "contextKey");

-- CreateIndex
CREATE INDEX "ExposureEvent_featureFlagEnvironmentId_createdAt_idx" ON "ExposureEvent"("featureFlagEnvironmentId", "createdAt");

-- CreateIndex
CREATE INDEX "ExposureEvent_projectId_createdAt_idx" ON "ExposureEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ExposureEvent_createdAt_idx" ON "ExposureEvent"("createdAt");

-- CreateIndex
CREATE INDEX "MetricsBucket_type_featureFlagEnvironmentId_featureFlagId_s_idx" ON "MetricsBucket"("type", "featureFlagEnvironmentId", "featureFlagId", "strategyId", "variantId", "bucketDate");

-- CreateIndex
CREATE INDEX "MetricsBucket_projectId_featureFlagEnvironmentId_idx" ON "MetricsBucket"("projectId", "featureFlagEnvironmentId");

-- CreateIndex
CREATE INDEX "MetricsBucket_featureFlagId_bucketDate_idx" ON "MetricsBucket"("featureFlagId", "bucketDate");

-- CreateIndex
CREATE INDEX "MetricsBucket_strategyId_bucketDate_idx" ON "MetricsBucket"("strategyId", "bucketDate");

-- CreateIndex
CREATE INDEX "MetricsBucket_variantId_bucketDate_idx" ON "MetricsBucket"("variantId", "bucketDate");

-- CreateIndex
CREATE INDEX "MetricsBucket_type_bucketDate_idx" ON "MetricsBucket"("type", "bucketDate");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_createdAt_idx" ON "AuditLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_idx" ON "NotificationDelivery"("status");

-- CreateIndex
CREATE INDEX "NotificationDelivery_channel_idx" ON "NotificationDelivery"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDelivery_notificationId_channel_key" ON "NotificationDelivery"("notificationId", "channel");

-- CreateIndex
CREATE INDEX "_SegmentToStrategy_B_index" ON "_SegmentToStrategy"("B");

-- CreateIndex
CREATE INDEX "_ActionStrategyToSegment_B_index" ON "_ActionStrategyToSegment"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Environment" ADD CONSTRAINT "Environment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flag_environments" ADD CONSTRAINT "feature_flag_environments_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flag_environments" ADD CONSTRAINT "feature_flag_environments_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_featureFlagEnvironmentId_fkey" FOREIGN KEY ("featureFlagEnvironmentId") REFERENCES "feature_flag_environments"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_rules" ADD CONSTRAINT "strategy_rules_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyVariant" ADD CONSTRAINT "StrategyVariant_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyVariant" ADD CONSTRAINT "StrategyVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_rules" ADD CONSTRAINT "segment_rules_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segments"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_strategies" ADD CONSTRAINT "action_strategies_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_strategy_rules" ADD CONSTRAINT "action_strategy_rules_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "action_strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExposureEvent" ADD CONSTRAINT "ExposureEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExposureEvent" ADD CONSTRAINT "ExposureEvent_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExposureEvent" ADD CONSTRAINT "ExposureEvent_featureFlagEnvironmentId_fkey" FOREIGN KEY ("featureFlagEnvironmentId") REFERENCES "feature_flag_environments"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExposureEvent" ADD CONSTRAINT "ExposureEvent_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExposureEvent" ADD CONSTRAINT "ExposureEvent_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricsBucket" ADD CONSTRAINT "MetricsBucket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricsBucket" ADD CONSTRAINT "MetricsBucket_featureFlagEnvironmentId_fkey" FOREIGN KEY ("featureFlagEnvironmentId") REFERENCES "feature_flag_environments"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricsBucket" ADD CONSTRAINT "MetricsBucket_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricsBucket" ADD CONSTRAINT "MetricsBucket_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricsBucket" ADD CONSTRAINT "MetricsBucket_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SegmentToStrategy" ADD CONSTRAINT "_SegmentToStrategy_A_fkey" FOREIGN KEY ("A") REFERENCES "segments"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SegmentToStrategy" ADD CONSTRAINT "_SegmentToStrategy_B_fkey" FOREIGN KEY ("B") REFERENCES "strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActionStrategyToSegment" ADD CONSTRAINT "_ActionStrategyToSegment_A_fkey" FOREIGN KEY ("A") REFERENCES "action_strategies"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActionStrategyToSegment" ADD CONSTRAINT "_ActionStrategyToSegment_B_fkey" FOREIGN KEY ("B") REFERENCES "segments"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
