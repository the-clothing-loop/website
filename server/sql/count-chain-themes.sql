-- Which colors the host have used for theme app
SELECT
  theme,
  COUNT(*) AS amount
FROM
  chains
GROUP BY
  theme
HAVING
  theme != ""
ORDER BY
  amount DESC;