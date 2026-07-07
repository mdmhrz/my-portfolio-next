-- CreateTable
CREATE TABLE "vault_audit_log" (
    "id" TEXT NOT NULL,
    "vaultItemId" TEXT,
    "action" TEXT NOT NULL,
    "fieldLabel" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_login_attempt" (
    "id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_login_attempt_pkey" PRIMARY KEY ("id")
);
