--- Run `dev-purge.sql` and `make generate-fake-data` before running for the best result

UPDATE users SET email = "admin@example.com", is_root_admin = TRUE WHERE id = 1;
UPDATE users SET email = "host@example.com" WHERE id = 2;
UPDATE user_chains SET is_chain_admin = TRUE WHERE user_id = 2;
UPDATE users SET email = "user@example.com" WHERE id = 3;
UPDATE user_chains SET is_chain_admin = FALSE WHERE user_id = 3;
