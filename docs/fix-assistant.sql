--fix properties has not any assistance record

SELECT 
    p.id AS property_id,
    true AS is_owner,
    u.mobile_number AS assistant_mobile_number,
    u.full_name AS assistant_full_name,
    NOW() AS created_at,
    NOW() AS updated_at
FROM properties p
INNER JOIN owners o ON p.owner_id = o.id
INNER JOIN users u ON u.owner_id = o.id
WHERE NOT EXISTS (
    SELECT 1
    FROM property_owner_assistants poa
    WHERE poa.property_id = p.id
) and p.status =20



INSERT INTO property_owner_assistants (property_id, is_owner, assistant_mobile_number, assistant_full_name, created_at, updated_at)
SELECT 
    p.id,
    true AS is_owner,
    u.mobile_number AS assistant_mobile_number,
    u.full_name AS assistant_full_name,
    NOW(),
    NOW()
FROM properties p
INNER JOIN owners o ON p.owner_id = o.id
INNER JOIN users u ON u.owner_id = o.id
WHERE NOT EXISTS (
    SELECT 1
    FROM property_owner_assistants poa
    WHERE poa.property_id = p.id
) and p.status =20