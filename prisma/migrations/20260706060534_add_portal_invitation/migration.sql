-- CreateTable
CREATE TABLE "portal_invitations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "portalAccountId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_invitations_tokenHash_key" ON "portal_invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "portal_invitations_organizationId_idx" ON "portal_invitations"("organizationId");

-- CreateIndex
CREATE INDEX "portal_invitations_applicantId_idx" ON "portal_invitations"("applicantId");

-- CreateIndex
CREATE INDEX "portal_invitations_expiresAt_idx" ON "portal_invitations"("expiresAt");

-- AddForeignKey
ALTER TABLE "portal_invitations" ADD CONSTRAINT "portal_invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_invitations" ADD CONSTRAINT "portal_invitations_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_invitations" ADD CONSTRAINT "portal_invitations_portalAccountId_fkey" FOREIGN KEY ("portalAccountId") REFERENCES "portal_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_invitations" ADD CONSTRAINT "portal_invitations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
