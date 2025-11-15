-- Kuuza Bank Database Setup for Supabase
-- Exécutez ce script dans le SQL Editor de votre dashboard Supabase

-- Create enums
CREATE TYPE "Role" AS ENUM ('MANAGER', 'CLIENT');
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT', 'TRANSFER', 'BUY_CREDIT');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Manager table
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creditBalance" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- Create Client table
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "accountBalance" BIGINT NOT NULL DEFAULT 0,
    "activationToken" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "description" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Create OrangeMoneyPayment table
CREATE TABLE "OrangeMoneyPayment" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "phoneNumber" TEXT,
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrangeMoneyPayment_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Manager_userId_key" ON "Manager"("userId");
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE UNIQUE INDEX "Client_activationToken_key" ON "Client"("activationToken");
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");
CREATE UNIQUE INDEX "OrangeMoneyPayment_transactionId_key" ON "OrangeMoneyPayment"("transactionId");

-- Create indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Manager_userId_idx" ON "Manager"("userId");
CREATE INDEX "Client_userId_idx" ON "Client"("userId");
CREATE INDEX "Client_managerId_idx" ON "Client"("managerId");
CREATE INDEX "Client_activationToken_idx" ON "Client"("activationToken");
CREATE INDEX "Transaction_fromUserId_idx" ON "Transaction"("fromUserId");
CREATE INDEX "Transaction_toUserId_idx" ON "Transaction"("toUserId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_reference_idx" ON "Transaction"("reference");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt" DESC);
CREATE INDEX "OrangeMoneyPayment_managerId_idx" ON "OrangeMoneyPayment"("managerId");
CREATE INDEX "OrangeMoneyPayment_transactionId_idx" ON "OrangeMoneyPayment"("transactionId");
CREATE INDEX "OrangeMoneyPayment_status_idx" ON "OrangeMoneyPayment"("status");

-- Add foreign key constraints
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrangeMoneyPayment" ADD CONSTRAINT "OrangeMoneyPayment_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrangeMoneyPayment" ADD CONSTRAINT "OrangeMoneyPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Function to generate CUID-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    random_part TEXT;
    counter_part TEXT;
BEGIN
    -- Get timestamp in base36
    timestamp_part := LPAD(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT), 8, '0');

    -- Generate random part
    random_part := LPAD(TO_HEX((RANDOM() * 4294967295)::BIGINT), 8, '0');

    -- Simple counter (you can make this more sophisticated)
    counter_part := LPAD(TO_HEX((RANDOM() * 65535)::INT), 4, '0');

    RETURN 'c' || timestamp_part || random_part || counter_part;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically generate IDs
CREATE OR REPLACE FUNCTION set_id_if_empty() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := generate_cuid();
    END IF;
    NEW.updatedAt := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER set_user_id BEFORE INSERT OR UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE set_id_if_empty();
CREATE TRIGGER set_manager_id BEFORE INSERT OR UPDATE ON "Manager" FOR EACH ROW EXECUTE PROCEDURE set_id_if_empty();
CREATE TRIGGER set_client_id BEFORE INSERT OR UPDATE ON "Client" FOR EACH ROW EXECUTE PROCEDURE set_id_if_empty();
CREATE TRIGGER set_transaction_id BEFORE INSERT OR UPDATE ON "Transaction" FOR EACH ROW EXECUTE PROCEDURE set_id_if_empty();
CREATE TRIGGER set_payment_id BEFORE INSERT OR UPDATE ON "OrangeMoneyPayment" FOR EACH ROW EXECUTE PROCEDURE set_id_if_empty();