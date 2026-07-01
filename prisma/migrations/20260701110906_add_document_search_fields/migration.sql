-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "description" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "title" TEXT;
