package models

import (
	"github.com/microcosm-cc/bluemonday"
	"github.com/the-clothing-loop/website/server/sharedtypes"
)

type Event sharedtypes.Event

const EventGetSql = `SELECT
events.id                    AS id,
events.uid                   AS uid,
events.name                  AS name,
events.description           AS description,
events.latitude              AS latitude,
events.longitude             AS longitude,
events.address               AS address,
events.price_value           AS price_value,
events.price_currency        AS price_currency,
events.price_type            AS price_type,
events.link                  AS link,
events.date                  AS date,
events.date_end              AS date_end,
events.genders               AS genders,
events.chain_id              AS chain_id,
chains.uid                   AS chain_uid,
events.user_id               AS user_id,
events.created_at            AS created_at,
events.updated_at            AS updated_at,
users.uid                    AS user_uid,
users.name                   AS user_name,
users.email                  AS user_email,
events.image_url             AS image_url,
chains.name                  AS chain_name
FROM events
LEFT JOIN chains ON chains.id = chain_id
LEFT JOIN users ON users.id = user_id
`

func (e *Event) ValidateDescription() {
	p := bluemonday.UGCPolicy()
	e.Description = p.Sanitize(e.Description)
}
