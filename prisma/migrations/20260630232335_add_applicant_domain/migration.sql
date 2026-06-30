-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('active', 'inactive', 'archived');

-- AlterTable
ALTER TABLE "portal_accounts" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "applicantId" UUID;

-- CreateTable
CREATE TABLE "applicants" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" DATE,
    "nationality" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_assignments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "assignedBy" UUID,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applicant_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applicants_applicantNumber_key" ON "applicants"("applicantNumber");

-- CreateIndex
CREATE INDEX "applicants_organizationId_idx" ON "applicants"("organizationId");

-- CreateIndex
CREATE INDEX "applicants_applicantNumber_idx" ON "applicants"("applicantNumber");

-- CreateIndex
CREATE INDEX "applicants_status_idx" ON "applicants"("status");

-- CreateIndex
CREATE INDEX "applicants_lastName_idx" ON "applicants"("lastName");

-- CreateIndex
CREATE INDEX "applicants_email_idx" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "applicants_organizationId_status_idx" ON "applicants"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_organizationId_email_key" ON "applicants"("organizationId", "email");

-- CreateIndex
CREATE INDEX "applicant_assignments_applicantId_idx" ON "applicant_assignments"("applicantId");

-- CreateIndex
CREATE INDEX "applicant_assignments_staffId_idx" ON "applicant_assignments"("staffId");

-- CreateIndex
CREATE INDEX "applicant_assignments_organizationId_idx" ON "applicant_assignments"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "portal_accounts_applicantId_key" ON "portal_accounts"("applicantId");

-- AddForeignKey
ALTER TABLE "portal_accounts" ADD CONSTRAINT "portal_accounts_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_assignments" ADD CONSTRAINT "applicant_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_assignments" ADD CONSTRAINT "applicant_assignments_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_assignments" ADD CONSTRAINT "applicant_assignments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_assignments" ADD CONSTRAINT "applicant_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

