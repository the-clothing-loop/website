-- Find chains that are published but have no verified host

SELECT c_.id, c_.name
FROM chains AS c_
WHERE c_.id IN (
        SELECT uc_.chain_id
        FROM user_chains AS uc_
            JOIN users AS u_ ON u_.id = uc_.user_id
        WHERE
            uc_.is_chain_admin = TRUE
            AND u_.is_email_verified = FALSE
    )
    AND c_.id NOT IN (
        SELECT uc_2.chain_id
        FROM user_chains AS uc_2
            JOIN users AS u_2 ON u_2.id = uc_2.user_id
        WHERE
            uc_2.is_chain_admin = TRUE
            AND u_2.is_email_verified = TRUE
    )
    AND c_.published = TRUE;