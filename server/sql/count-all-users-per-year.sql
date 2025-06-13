-- Total user accounts created, including possible duplicates, or gdpr removal that are since deleted, till start YYYY
-- replace YYYY to your specific year
SELECT
  id
FROM
  users
WHERE
  created_at < DATE ("YYYY-01-01")
ORDER BY
  created_at DESC
LIMIT
  1;

-- Total users who are not deleted till start YYYY
-- replace YYYY to your specific year
SELECT
  COUNT(*)
FROM
  users
WHERE
  created_at < DATE ("YYYY-01-01")
ORDER BY
  created_at DESC
LIMIT
  1;