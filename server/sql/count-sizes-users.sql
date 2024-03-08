-- Find count of users who are interested in a category
SELECT (
	SELECT COUNT(id) FROM users
	WHERE sizes IS NOT NULL AND (
		sizes LIKE "%1%"
		OR sizes LIKE "%2%"
		OR sizes LIKE "%3%"
	)
) AS interested_children, (
	SELECT COUNT(id) FROM users
	WHERE sizes IS NOT NULL AND (
		sizes LIKE "%4%"
		OR sizes LIKE "%5%"
		OR sizes LIKE "%6%"
		OR sizes LIKE "%7%"
	)
) AS interested_womans, (
	SELECT COUNT(id) FROM users
	WHERE sizes IS NOT NULL AND (
		sizes LIKE "%8%"
		OR sizes LIKE "%9%"
		OR sizes LIKE "%A%"
		OR sizes LIKE "%B%"
	)
) AS interested_mens;
