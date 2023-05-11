--- List loop hosts and the pending participants older than 60 days

SELECT
    u2.id,
    u2.name,
    u2.email,
    uc.chain_id,
    JSON_ARRAYAGG(
        CONCAT(
            "unapproved user id: ",
            u.id,
            ", name: ",
            u.name,
            ", email: ",
            u.email
        )
    ) AS unapproved_users
FROM user_chains AS uc
    JOIN users AS u ON u.id = uc.user_id
    INNER JOIN user_chains AS uc2 ON uc2.chain_id = uc.chain_id AND uc2.is_chain_admin = TRUE
    JOIN users AS u2 ON u2.id = uc2.user_id
WHERE
    uc.is_approved = FALSE
    AND uc.created_at < (NOW() - INTERVAL 60 DAY)
GROUP BY u2.id
ORDER BY uc.chain_id ASC;

--- List participants older than 60 days

SELECT
    u.id,
    u.name,
    u.email,
    uc.chain_id,
    JSON_ARRAYAGG(
        CONCAT(
            "host_id: ",
            u2.id,
            ", host_name: ",
            u2.name,
            ", host_email: ",
            u2.email
        )
    ) AS hosts
FROM user_chains AS uc
    JOIN users AS u ON u.id = uc.user_id
    INNER JOIN user_chains AS uc2 ON uc2.chain_id = uc.chain_id AND uc2.is_chain_admin = TRUE
    JOIN users AS u2 ON u2.id = uc2.user_id
WHERE
    uc.is_approved = FALSE
    AND uc.created_at < (NOW() - INTERVAL 60 DAY)
GROUP BY u.id
ORDER BY uc.chain_id ASC;