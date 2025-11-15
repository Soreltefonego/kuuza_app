-- Script de correction pour les déclencheurs PostgreSQL
-- Exécutez ce script dans le SQL Editor de votre dashboard Supabase

-- Supprimer les anciens déclencheurs qui causent des problèmes
DROP TRIGGER IF EXISTS set_user_id ON "User";
DROP TRIGGER IF EXISTS set_manager_id ON "Manager";
DROP TRIGGER IF EXISTS set_client_id ON "Client";
DROP TRIGGER IF EXISTS set_transaction_id ON "Transaction";
DROP TRIGGER IF EXISTS set_payment_id ON "OrangeMoneyPayment";

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS set_id_if_empty();

-- Créer une nouvelle fonction corrigée pour les déclencheurs
CREATE OR REPLACE FUNCTION set_id_and_timestamp() RETURNS TRIGGER AS $$
BEGIN
    -- Générer un ID si vide
    IF NEW.id IS NULL OR NEW.id = '' THEN
        NEW.id := generate_cuid();
    END IF;

    -- Mettre à jour le timestamp en utilisant le bon nom de colonne
    NEW."updatedAt" := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer les déclencheurs avec la fonction corrigée
CREATE TRIGGER set_user_id_and_time
    BEFORE INSERT OR UPDATE ON "User"
    FOR EACH ROW EXECUTE PROCEDURE set_id_and_timestamp();

CREATE TRIGGER set_manager_id_and_time
    BEFORE INSERT OR UPDATE ON "Manager"
    FOR EACH ROW EXECUTE PROCEDURE set_id_and_timestamp();

CREATE TRIGGER set_client_id_and_time
    BEFORE INSERT OR UPDATE ON "Client"
    FOR EACH ROW EXECUTE PROCEDURE set_id_and_timestamp();

CREATE TRIGGER set_transaction_id_and_time
    BEFORE INSERT OR UPDATE ON "Transaction"
    FOR EACH ROW EXECUTE PROCEDURE set_id_and_timestamp();

CREATE TRIGGER set_payment_id_and_time
    BEFORE INSERT OR UPDATE ON "OrangeMoneyPayment"
    FOR EACH ROW EXECUTE PROCEDURE set_id_and_timestamp();