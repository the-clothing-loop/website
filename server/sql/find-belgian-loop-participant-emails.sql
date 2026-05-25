-- Count and list distinct email addresses for approved users in Belgian Loops.

SELECT
    COUNT(DISTINCT u.email) AS total_email_addresses
FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
JOIN chains AS c ON c.id = uc.chain_id
WHERE c.country_code = 'BE'
  AND uc.is_approved = TRUE
  AND u.email IS NOT NULL;

SELECT DISTINCT
    u.email
FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
JOIN chains AS c ON c.id = uc.chain_id
WHERE c.country_code = 'BE'
  AND uc.is_approved = TRUE
  AND u.email IS NOT NULL
ORDER BY u.email;
