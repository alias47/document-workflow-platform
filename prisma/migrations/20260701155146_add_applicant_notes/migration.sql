-- CreateTable
CREATE TABLE "applicant_notes" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "applicant_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applicant_notes_organizationId_idx" ON "applicant_notes"("organizationId");

-- CreateIndex
CREATE INDEX "applicant_notes_applicantId_idx" ON "applicant_notes"("applicantId");

-- CreateIndex
CREATE INDEX "applicant_notes_authorId_idx" ON "applicant_notes"("authorId");

-- CreateIndex
CREATE INDEX "applicant_notes_applicantId_createdAt_idx" ON "applicant_notes"("applicantId", "createdAt");

-- AddForeignKey
ALTER TABLE "applicant_notes" ADD CONSTRAINT "applicant_notes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_notes" ADD CONSTRAINT "applicant_notes_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_notes" ADD CONSTRAINT "applicant_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
