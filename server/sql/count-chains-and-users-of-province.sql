SELECT(
	SELECT COUNT(c.id)
	FROM chains AS c
	WHERE address LIKE CONCAT('%', 'North Holland', '%')
) AS total_chains
,(
	SELECT COUNT(uc.id)
	FROM chains AS c
	LEFT JOIN user_chains AS uc ON uc.chain_id = c.id
	WHERE address LIKE CONCAT('%', 'North Holland', '%')
) AS total_participants;
