-- Fonction pour créer un utilisateur et un manager en contournant les déclencheurs
-- Exécutez ce script dans le SQL Editor de votre dashboard Supabase

CREATE OR REPLACE FUNCTION create_user_manager(
    p_user_id TEXT,
    p_email TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_timestamp TIMESTAMP DEFAULT NOW()
) RETURNS JSON AS $$
DECLARE
    v_manager_id TEXT;
    v_result JSON;
BEGIN
    -- Générer un ID pour le manager
    v_manager_id := generate_cuid();

    -- Insérer l'utilisateur directement sans déclencher les triggers
    INSERT INTO "User" (
        "id",
        "email",
        "password",
        "firstName",
        "lastName",
        "phone",
        "role",
        "createdAt",
        "updatedAt"
    ) VALUES (
        p_user_id,
        p_email,
        p_password,
        p_first_name,
        p_last_name,
        p_phone,
        'MANAGER',
        p_timestamp,
        p_timestamp
    );

    -- Insérer le manager directement sans déclencher les triggers
    INSERT INTO "Manager" (
        "id",
        "userId",
        "creditBalance",
        "createdAt",
        "updatedAt"
    ) VALUES (
        v_manager_id,
        p_user_id,
        0,
        p_timestamp,
        p_timestamp
    );

    -- Retourner les données de l'utilisateur créé
    SELECT json_build_object(
        'id', p_user_id,
        'email', p_email,
        'firstName', p_first_name,
        'lastName', p_last_name,
        'phone', p_phone,
        'role', 'MANAGER'
    ) INTO v_result;

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, lever une exception
        RAISE EXCEPTION 'Erreur lors de la création: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;