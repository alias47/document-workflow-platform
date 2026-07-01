-- CreateTable
CREATE TABLE "workflow_stages" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "workflow_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_workflows" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "currentStageId" UUID NOT NULL,
    "enteredStageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedCompletionDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "applicant_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_history" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "fromStageId" UUID,
    "toStageId" UUID NOT NULL,
    "changedBy" UUID,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,

    CONSTRAINT "workflow_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_stages_organizationId_idx" ON "workflow_stages"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_stages_organizationId_order_idx" ON "workflow_stages"("organizationId", "order");

-- CreateIndex
CREATE INDEX "workflow_stages_isDefault_idx" ON "workflow_stages"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_workflows_applicantId_key" ON "applicant_workflows"("applicantId");

-- CreateIndex
CREATE INDEX "applicant_workflows_organizationId_idx" ON "applicant_workflows"("organizationId");

-- CreateIndex
CREATE INDEX "applicant_workflows_currentStageId_idx" ON "applicant_workflows"("currentStageId");

-- CreateIndex
CREATE INDEX "workflow_history_organizationId_idx" ON "workflow_history"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_history_applicantId_idx" ON "workflow_history"("applicantId");

-- CreateIndex
CREATE INDEX "workflow_history_applicantId_changedAt_idx" ON "workflow_history"("applicantId", "changedAt");

-- AddForeignKey
ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_workflows" ADD CONSTRAINT "applicant_workflows_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_workflows" ADD CONSTRAINT "applicant_workflows_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "workflow_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "workflow_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "workflow_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
