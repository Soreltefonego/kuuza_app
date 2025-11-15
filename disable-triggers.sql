-- Script pour désactiver temporairement les déclencheurs problématiques
-- Exécutez ce script immédiatement dans votre dashboard Supabase

-- Désactiver tous les déclencheurs problématiques
DROP TRIGGER IF EXISTS set_user_id ON "User";
DROP TRIGGER IF EXISTS set_manager_id ON "Manager";
DROP TRIGGER IF EXISTS set_client_id ON "Client";
DROP TRIGGER IF EXISTS set_transaction_id ON "Transaction";
DROP TRIGGER IF EXISTS set_payment_id ON "OrangeMoneyPayment";

-- Désactiver la fonction qui cause le problème
DROP FUNCTION IF EXISTS set_id_if_empty();