-- CreateTable
CREATE TABLE "applicant_activities" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actorId" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applicant_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applicant_activities_organizationId_idx" ON "applicant_activities"("organizationId");

-- CreateIndex
CREATE INDEX "applicant_activities_applicantId_idx" ON "applicant_activities"("applicantId");

-- CreateIndex
CREATE INDEX "applicant_activities_applicantId_createdAt_idx" ON "applicant_activities"("applicantId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "applicant_activities" ADD CONSTRAINT "applicant_activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_activities" ADD CONSTRAINT "applicant_activities_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_activities" ADD CONSTRAINT "applicant_activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
