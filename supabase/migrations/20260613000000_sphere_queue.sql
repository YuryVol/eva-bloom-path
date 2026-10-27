-- Sphere queue: tracks which spheres are queued after the first journey
-- Structure: [{sphere_id, score, position, status}]
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sphere_queue jsonb DEFAULT NULL;
