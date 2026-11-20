-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('pending', 'needs_info', 'pending_vendor', 'in_review', 'error_retrying', 'approved', 'denied', 'active');

-- CreateEnum
CREATE TYPE "AlloyOutcome" AS ENUM ('Approved', 'Denied', 'Manual Review');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('checking', 'savings', 'credit');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "dobEncrypted" BYTEA NOT NULL,
    "ssnLast4" CHAR(4) NOT NULL,
    "piiDataKey" BYTEA NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "reapplyAfter" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "isCurrent" BOOLEAN NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "postalCode" TEXT NOT NULL,
    "countryCode" CHAR(2) NOT NULL DEFAULT 'US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_applications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'pending',
    "evaluationToken" TEXT,
    "entityToken" TEXT,
    "applicationToken" TEXT,
    "alloyStatusCode" INTEGER,
    "outcome" "AlloyOutcome",
    "outcomeReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exitedEarly" BOOLEAN NOT NULL DEFAULT false,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" TEXT,
    "reviewStartedAt" TIMESTAMP(3),
    "slaDueAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alloy_webhook_events" (
    "id" UUID NOT NULL,
    "requestToken" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "alloy_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "template" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "AccountType" NOT NULL,
    "name" TEXT NOT NULL,
    "mask" CHAR(4) NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "plaidAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "merchantName" TEXT NOT NULL,
    "category" TEXT,
    "postedOn" DATE NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "plaidTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID,
    "applicationId" UUID,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "KycStatus",
    "toStatus" "KycStatus",
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_applications_evaluationToken_key" ON "kyc_applications"("evaluationToken");

-- CreateIndex
CREATE INDEX "kyc_applications_userId_idx" ON "kyc_applications"("userId");

-- CreateIndex
CREATE INDEX "kyc_applications_status_updatedAt_idx" ON "kyc_applications"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "alloy_webhook_events_requestToken_key" ON "alloy_webhook_events"("requestToken");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_applicationId_template_key" ON "notifications"("applicationId", "template");

-- CreateIndex
CREATE UNIQUE INDEX "financial_accounts_plaidAccountId_key" ON "financial_accounts"("plaidAccountId");

-- CreateIndex
CREATE INDEX "financial_accounts_userId_idx" ON "financial_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_plaidTransactionId_key" ON "transactions"("plaidTransactionId");

-- CreateIndex
CREATE INDEX "transactions_accountId_postedOn_idx" ON "transactions"("accountId", "postedOn");

-- CreateIndex
CREATE INDEX "audit_log_applicationId_createdAt_idx" ON "audit_log"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_applications" ADD CONSTRAINT "kyc_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "kyc_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
