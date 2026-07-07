-- CreateTable
CREATE TABLE "vault_item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_field" (
    "id" TEXT NOT NULL,
    "vaultItemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'password',
    "encryptedValue" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vault_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_item_history" (
    "id" TEXT NOT NULL,
    "vaultItemId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_item_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vault_field" ADD CONSTRAINT "vault_field_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "vault_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_item_history" ADD CONSTRAINT "vault_item_history_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "vault_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
