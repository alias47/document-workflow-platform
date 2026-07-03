-- CreateTable
CREATE TABLE "portal_refresh_tokens" (
    "id" UUID NOT NULL,
    "portalAccountId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" UUID,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_refresh_tokens_tokenHash_key" ON "portal_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "portal_refresh_tokens_portalAccountId_idx" ON "portal_refresh_tokens"("portalAccountId");

-- CreateIndex
CREATE INDEX "portal_refresh_tokens_tokenHash_idx" ON "portal_refresh_tokens"("tokenHash");

-- AddForeignKey
ALTER TABLE "portal_refresh_tokens" ADD CONSTRAINT "portal_refresh_tokens_portalAccountId_fkey" FOREIGN KEY ("portalAccountId") REFERENCES "portal_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
