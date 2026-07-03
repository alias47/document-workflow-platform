-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('pending', 'uploaded', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "requirementId" UUID;

-- CreateTable
CREATE TABLE "document_requirements" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "DocumentCategory" NOT NULL DEFAULT 'other',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_document_requirements" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "requirementId" UUID NOT NULL,
    "status" "RequirementStatus" NOT NULL DEFAULT 'pending',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "applicant_document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_requirements_organizationId_idx" ON "document_requirements"("organizationId");

-- CreateIndex
CREATE INDEX "document_requirements_organizationId_isActive_idx" ON "document_requirements"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "document_requirements_organizationId_sortOrder_idx" ON "document_requirements"("organizationId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "document_requirements_organizationId_name_key" ON "document_requirements"("organizationId", "name");

-- CreateIndex
CREATE INDEX "applicant_document_requirements_applicantId_idx" ON "applicant_document_requirements"("applicantId");

-- CreateIndex
CREATE INDEX "applicant_document_requirements_requirementId_idx" ON "applicant_document_requirements"("requirementId");

-- CreateIndex
CREATE INDEX "applicant_document_requirements_status_idx" ON "applicant_document_requirements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_document_requirements_applicantId_requirementId_key" ON "applicant_document_requirements"("applicantId", "requirementId");

-- CreateIndex
CREATE INDEX "documents_requirementId_idx" ON "documents"("requirementId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "applicant_document_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_document_requirements" ADD CONSTRAINT "applicant_document_requirements_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_document_requirements" ADD CONSTRAINT "applicant_document_requirements_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "document_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
