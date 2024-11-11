export interface Bag {
	id: number
	number: string
	color: string
	chain_uid: string
	user_uid: string
	updated_at: string
}

export interface BulkyItem {
	id: number
	title: string
	message: string
	image_url: string
	chain_uid: string
	user_uid: string
	created_at: string
}

export interface ChainAddUserRequest {
	user_uid: string
	chain_uid: string
	is_chain_admin: boolean
}

export interface ChainApproveUserRequest {
	user_uid: string
	chain_uid: string
}

export interface ChainChangeUserWardenRequest {
	user_uid: string
	chain_uid: string
	warden: boolean
}

export interface ChainCreateRequest {
	name: string
	description: string
	address: string
	country_code: string
	latitude: number
	longitude: number
	radius: number
	open_to_new_members: boolean
	sizes: string[]
	genders: string[]
	allow_toh: boolean
}

export interface ChainRemoveUserRequest {
	user_uid: string
	chain_uid: string
}

export interface ChainResponse {
	uid: string
	name: string
	description: string
	address: string
	image: (string | null)
	latitude: number
	longitude: number
	radius: number
	sizes: string[]
	genders: string[]
	published: boolean
	open_to_new_members: boolean
	total_members?: (number | null)
	total_hosts?: (number | null)
	rules_override?: (string | null)
	headers_override?: (string | null)
	theme?: (string | null)
	is_app_disabled?: (boolean | null)
	route_privacy?: (number | null)
	allow_map?: (boolean | null)
	chat_room_ids?: string[]
}

export interface ChainUpdateRequest {
	uid: string
	name?: (string | null)
	description?: (string | null)
	address?: (string | null)
	image?: (string | null)
	country_code?: (string | null)
	latitude?: (number | null)
	longitude?: (number | null)
	radius?: (number | null)
	sizes?: (string[] | null)
	genders?: (string[] | null)
	rules_override?: (string | null)
	headers_override?: (string | null)
	published?: (boolean | null)
	open_to_new_members?: (boolean | null)
	theme?: (string | null)
	route_privacy: (number | null)
	allow_map?: (boolean | null)
	is_app_disabled?: (boolean | null)
}

export interface ContactMailRequest {
	name: string
	email: string
	message: string
}

export interface ContactNewsletterRequest {
	name: string
	email: string
	subscribe: boolean
}

export type ErrInvalidEventPriceType = Record<string, any>

export interface Event {
	uid: string
	name: string
	description: string
	latitude: number
	longitude: number
	address: string
	price_value: number
	price_currency: (string | null)
	price_type: (EventPriceType | null)
	link: string
	date: string
	date_end: (string | null)
	genders: string[]
	chain_uid: (string | null)
	user_uid: (string | null)
	user_name: (string | null)
	user_email: (string | null)
	image_url: string
	chain_name: (string | null)
}

export interface EventCreateRequest {
	name: string
	description: string
	latitude: number
	longitude: number
	address: string
	price_value: number
	price_currency: string
	price_type: EventPriceType
	link: string
	date: string
	date_end: (string | null)
	genders: string[]
	chain_uid?: string
	image_url: string
	image_delete_url: string
}

export type EventPriceType = string

export type EventPriceTypeDonation = string

export type EventPriceTypeEntrance = string

export type EventPriceTypeFree = string

export type EventPriceTypePerswap = string

export interface EventUpdateRequest {
	uid: string
	name?: (string | null)
	description?: (string | null)
	address?: (string | null)
	link?: (string | null)
	price_value?: (number | null)
	price_currency?: (string | null)
	price_type?: (EventPriceType | null)
	latitude?: (number | null)
	longitude?: (number | null)
	date?: (string | null)
	date_end?: (string | null)
	genders?: (string[] | null)
	image_url?: (string | null)
	image_delete_url?: (string | null)
	chain_uid?: (string | null)
}

export interface ImageUploadResponse {
	delete: string
	thumbnail: string
	image: string
}

export interface Info {
	total_chains: number
	total_users: number
	total_countries: number
}

export interface InfoTopLoop {
	uid: string
	name: string
	members_count: number
}

export interface LoginEmailRequest {
	email: string
	app: boolean
	chain_uid: string
}

export interface LoginSuperAsGenerateLinkRequest {
	user_uid: string
	is_app: boolean
}

export type NewNullEventPriceType = unknown

export interface NullEventPriceType {
	EventPriceType: EventPriceType
	Valid: boolean
	Set: boolean
}

export type ParseEventPriceType = unknown

export interface PaymentsInitiateRequest {
	price_cents: number
	email: string
	is_recurring: boolean
	price_id: string
}

export interface PaymentsInitiateResponse {
	session_id: string
}

export interface RegisterBasicUserRequest {
	chain_uid: string
	user: UserCreateRequest
}

export interface RegisterChainAdminRequest {
	chain: ChainCreateRequest
	user: UserCreateRequest
}

export interface RouteCoordinatesGetResponseItem {
	user_uid: string
	latitude: number
	longitude: number
	route_order: number
}

export interface RouteOrderSet {
	chain_uid: string
	route_order: string[]
}

export interface User {
	uid: string
	email: (string | null)
	is_email_verified: boolean
	is_root_admin: boolean
	paused_until: (string | null)
	name: string
	phone_number: string
	address: string
	sizes: string[]
	chains: UserChain[]
	i18n: string
	accepted_toh?: (boolean | null)
	accepted_dpa?: (boolean | null)
	notification_chain_uids?: string[]
}

export interface UserChain {
	user_uid: string
	chain_uid: string
	is_chain_admin: boolean
	is_chain_warden: boolean
	created_at: string
	is_approved: boolean
	is_paused: boolean
}

export interface UserCreateRequest {
	email: string
	name: string
	address: string
	phone_number: string
	newsletter: boolean
	sizes: string[]
	latitude: number
	longitude: number
}

export interface UserOnesignal {
	ID: number
	PlayerID: string
	OnesignalID: string
	UserID: number
}

export interface UserToken {
	ID: number
	Token: string
	Verified: boolean
	UserID: number
	CreatedAt: string
}

export interface UserTransferChainRequest {
	transfer_user_uid: string
	from_chain_uid: string
	to_chain_uid: string
	is_copy: boolean
}

export interface UserUpdateRequest {
	chain_uid?: string
	user_uid?: string
	name?: (string | null)
	phone_number?: (string | null)
	newsletter?: (boolean | null)
	paused_until?: (string | null)
	chain_paused?: (boolean | null)
	sizes?: (string[] | null)
	address?: (string | null)
	i18n?: (string | null)
	latitude?: (number | null)
	longitude?: (number | null)
	accepted_legal?: (boolean | null)
}

type _EventPriceTypeValue = Record<string, EventPriceType>

type errEventPriceTypeNilPtr = Record<string, any>

