-- AlterEnum
ALTER TYPE "ApiKeyType" ADD VALUE 'AGENT';

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAgent" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
