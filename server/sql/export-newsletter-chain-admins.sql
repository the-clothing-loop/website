--- * You can run this in PhpMyAdmin when you are ready
--- * Export to CSV & download it
--- * Then in https://my.sendinblue.com/users/upload-user-contacts upload the file

SELECT 
	u.email AS EMAIL,
	REGEXP_REPLACE( u.name, '\\s.*', '') as FIRSTNAME,
	LTRIM(REGEXP_SUBSTR(u.name, '\\s.*')) AS LASTNAME,
	uc.is_chain_admin AS ISCHAINADMIN
FROM users AS u
JOIN user_chains AS uc ON uc.user_id = u.id 
GROUP BY u.id 
HAVING uc.is_chain_admin = TRUE AND u.email is not NULL;
