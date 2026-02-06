# Delete Loop Follow‑ups

This note captures the additional code changes that should be made later (not in the SQL‑only PR).

## API deletion flow

- Update `server/internal/models/chain.go` in `Chain.Delete` to remove chat data before deleting a chain:
  - `DELETE FROM chat_messages WHERE chat_channel_id IN (SELECT id FROM chat_channels WHERE chain_id = ?)`
  - `DELETE FROM chat_channels WHERE chain_id = ?`
- Rationale: the delete endpoint uses `Chain.Delete`, not the manual SQL script. Without this, UI deletes still fail due to chat FK constraints.

