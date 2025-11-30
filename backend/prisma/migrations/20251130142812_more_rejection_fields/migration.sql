-- AlterTable
ALTER TABLE "Rejection" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "sender" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3);
