-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
