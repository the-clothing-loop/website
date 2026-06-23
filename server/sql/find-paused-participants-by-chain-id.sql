-- List paused participants of one Loop by public Loop UID.
-- Change this value to the Loop UID you want to inspect.
SET @chain_uid = '00000000-0000-0000-0000-000000000000';

SELECT
    uc.chain_id,
    c.uid AS chain_uid,
    c.name AS chain_name,
    u.id AS user_id,
    u.name,
    u.email,
    CASE
        WHEN uc.is_paused = TRUE THEN 'loop_only'
        WHEN u.paused_until > NOW() THEN 'all_loops'
    END AS pause_type,
    CASE
        WHEN uc.is_paused = TRUE THEN NULL
        ELSE DATE(u.paused_until)
    END AS paused_until
FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
JOIN chains AS c ON c.id = uc.chain_id
WHERE
    c.uid = @chain_uid
    AND uc.is_approved = TRUE
    AND (
        uc.is_paused = TRUE
        OR u.paused_until > NOW()
    )
ORDER BY
    pause_type,
    u.name;

-- Note:
-- The database stores whether someone is paused for this Loop in user_chains.is_paused,
-- and stores a user-wide pause end date in users.paused_until.
-- It does not store the exact date when the pause was switched on.
