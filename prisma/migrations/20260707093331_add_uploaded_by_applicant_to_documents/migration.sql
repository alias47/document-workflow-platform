-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "uploadedByApplicantId" UUID;

-- CreateIndex
CREATE INDEX "documents_uploadedByApplicantId_idx" ON "documents"("uploadedByApplicantId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedByApplicantId_fkey" FOREIGN KEY ("uploadedByApplicantId") REFERENCES "applicants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
