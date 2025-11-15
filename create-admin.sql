-- Créer un utilisateur super admin
INSERT INTO "User" (
  id,
  email,
  password,
  firstName,
  lastName,
  phone,
  role,
  isEmailVerified,
  createdAt,
  updatedAt
) VALUES (
  gen_random_uuid(),
  'admin@kuuzabank.com',
  '$2a$10$YourHashedPasswordHere', -- Remplacez par le hash du mot de passe
  'Super',
  'Admin',
  '+237600000000',
  'ADMIN',
  true,
  NOW(),
  NOW()
);

-- Pour générer le hash du mot de passe, utilisez bcrypt
-- Exemple de mot de passe: Admin@123