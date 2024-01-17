--- Migrations for Terms of Hosts (should be run 40 days after ToH start)

-- After ToH start there will be steps to ease the migration:
-- Day 14 & 21: Email all unaccepted hosts to accept the toh.
-- Day 30:
--         1. Email unaccepted hosts that we will set them as participant, in Loops where +1 hosts have accepted toh.
--         2. Email all hosts in Loops, where all hosts have not accepted toh, that their Loop will be set to draft.
-- Day 40: Run migration
--         1. "List hosts, in loops where none of the hosts have accepted the toh" save for day 56
--         2. "Draft all Loops where all the hosts have not accepted the toh"
--         3. "Set all the hosts who have not accepted the toh, in a Loop where +1 hosts have accepted toh, as participant."
--         4. Uncomment cron func "closeChainsWithOldPendingParticipants"
-- Day 56: Send a reminder to hosts from loops, where all have not accepted toh
-- Day 65: Send an email to all participants asking if they what to become host for this loop.

--- Draft all Loops where all the hosts have not accepted the toh
UPDATE chains AS c2 SET c2.published = FALSE, c2.open_to_new_members = FALSE
WHERE c2.id IN ( 
	SELECT c.id FROM chains AS c
	WHERE c.published = TRUE AND (
		SELECT COUNT(uc.id) FROM user_chains AS uc
		JOIN users AS u ON uc.user_id = u.id
		WHERE uc.chain_id = c.id
			AND uc.is_chain_admin = TRUE
			AND uc.is_approved = TRUE
			AND COALESCE(u.accepted_toh, 0) != TRUE
	) > 0 AND (
		SELECT COUNT(uc.id) FROM user_chains AS uc
		JOIN users AS u ON uc.user_id = u.id
		WHERE uc.chain_id = c.id
			AND uc.is_chain_admin = TRUE
			AND uc.is_approved = TRUE
			AND u.accepted_toh = TRUE
	) = 0
);

--- List Loops where only some hosts have not accepted the toh
SELECT c.id, c.name,
   JSON_ARRAYAGG(CONCAT("host id: ",h.id," name: ", h.name," accepted_toh: ", COALESCE(accepted_toh, 0))) AS hosts
FROM chains AS c
JOIN user_chains AS uch ON uch.chain_id = c.id AND uch.is_chain_admin = TRUE
LEFT JOIN users AS h ON h.id = uch.user_id AND COALESCE(h.accepted_toh, 0) != TRUE
WHERE published = TRUE
GROUP BY c.id
HAVING (
		SELECT COUNT(uc.chain_id) FROM user_chains AS uc
		JOIN users AS u ON u.id = uc.user_id
		WHERE uc.is_chain_admin = TRUE
			AND uc.is_approved = TRUE
			AND uc.chain_id = c.id
			AND u.accepted_toh = TRUE
	) > 0
	AND (
		SELECT COUNT(uc.chain_id) FROM user_chains AS uc
		JOIN users AS u ON u.id = uc.user_id
		WHERE uc.is_chain_admin = TRUE
			AND uc.is_approved = TRUE
			AND uc.chain_id = c.id
			AND COALESCE(u.accepted_toh, 0) != TRUE
	) > 0;

-- List hosts, in loops where none of the hosts have accepted the toh
SELECT UNIQUE(uc.user_id) FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
WHERE uc.is_chain_admin = TRUE
	AND uc.is_approved = TRUE
	AND COALESCE(u.accepted_toh, 0) != TRUE
	AND (
		SELECT COUNT(uc2.user_id) FROM user_chains AS uc2
		JOIN users AS u2 ON uc2.user_id = u2.id
		WHERE uc2.chain_id = uc.chain_id
			AND uc2.is_chain_admin = TRUE
			AND u2.accepted_toh = TRUE
) > 0;

-- List hosts that have not accepted the toh
SELECT UNIQUE(uc.user_id) FROM user_chains AS uc
JOIN users AS u ON u.id = uc.user_id
WHERE uc.is_chain_admin = TRUE
	AND uc.is_approved = TRUE
	AND COALESCE(u.accepted_toh, 0) != TRUE

-- Set all the hosts who have not accepted the toh, in a Loop where +1 hosts have accepted toh, as participant.
UPDATE user_chains AS uc3 SET uc3.is_chain_admin = FALSE
WHERE uc3.user_id IN (
	SELECT uc.user_id FROM user_chains AS uc
	JOIN users AS u ON u.id = uc.user_id
	WHERE uc.is_chain_admin = TRUE
		AND uc.is_approved = TRUE
		AND COALESCE(u.accepted_toh, 0) != TRUE
		AND (
			SELECT COUNT(uc2.user_id) FROM user_chains AS uc2
			JOIN users AS u2 ON uc2.user_id = u2.id
			WHERE uc2.chain_id = uc.chain_id
				AND uc2.is_chain_admin = TRUE
				AND u2.accepted_toh = TRUE
	) > 0
);


-- List chains to close if pending participants are still pending 30 days after reminder email is sent
SELECT DISTINCT(uc.chain_id)
	FROM user_chains AS uc
	JOIN chains AS c ON c.id = uc.chain_id
	WHERE uc.is_approved = FALSE
		AND uc.last_notified_is_unapproved_at < (NOW() - INTERVAL 30 DAY)
		AND c.published = TRUE
		AND c.id NOT IN (
			SELECT DISTINCT(uc2.chain_id) FROM user_chains AS uc2
			JOIN users AS u2 ON u2.id = uc2.user_id
			WHERE u2.last_signed_in_at > (NOW() - INTERVAL 90 DAY)
				AND uc2.is_chain_admin = TRUE
		)