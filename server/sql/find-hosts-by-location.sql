-- The following methods of finding hosts by location is not an exact science

-- Find hosts by address name (least reliable)
SELECT u.email, u.name, JSON_ARRAYAGG(c.name) as chain_names FROM users AS u
JOIN user_chains AS uc ON uc.user_id = u.id AND uc.is_chain_admin = TRUE
JOIN chains AS c ON uc.chain_id = c.id AND c.published = TRUE 
WHERE u.address LIKE "%Zuid-Holland%" OR c.address LIKE "%Zuid-Holland%"
GROUP BY u.id
HAVING COUNT(uc.id);

-- Find hosts by gps coordinates
-- Go to https://www.clothingloop.org/en/events then click "select location"
-- After clicking on "select" the url will change to end to something like this:
-- d=55.7&lat=52.670473080291345&long=4.974475329585516
SELECT u.email, u.name, JSON_ARRAYAGG(c.name) as chain_names FROM users AS u
JOIN user_chains AS uc ON uc.user_id = u.id AND uc.is_chain_admin = TRUE
JOIN chains AS c ON uc.chain_id = c.id AND c.published = TRUE
WHERE
	(ST_Distance(
		POINT(c.latitude, c.longitude),
		-- Change here the cooridinates of the center of the circle
		POINT(52.670473080291345, 4.974475329585516)
	)  * 111.195) <=
	-- Edit the km radius
	55.700000
GROUP BY u.id
HAVING COUNT(uc.id);