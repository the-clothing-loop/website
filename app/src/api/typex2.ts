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
	image?: (string | null | undefined)
	latitude: number
	longitude: number
	radius: number
	sizes: string[]
	genders: string[]
	published: boolean
	open_to_new_members: boolean
	total_members?: (number | null | undefined)
	total_hosts?: (number | null | undefined)
	rules_override?: (string | null | undefined)
	headers_override?: (string | null | undefined)
	theme?: (string | null | undefined)
	is_app_disabled?: (boolean | null | undefined)
	route_privacy?: (number | null | undefined)
	allow_map?: (boolean | null | undefined)
	chat_room_ids?: (string[] | null | undefined)
}

export interface ChainUpdateRequest {
	uid: string
	name?: (string | null | undefined)
	description?: (string | null | undefined)
	address?: (string | null | undefined)
	image?: (string | null | undefined)
	country_code?: (string | null | undefined)
	latitude?: (number | null | undefined)
	longitude?: (number | null | undefined)
	radius?: (number | null | undefined)
	sizes?: (string[] | null | undefined)
	genders?: (string[] | null | undefined)
	rules_override?: (string | null | undefined)
	headers_override?: (string | null | undefined)
	published?: (boolean | null | undefined)
	open_to_new_members?: (boolean | null | undefined)
	theme?: (string | null | undefined)
	route_privacy?: (number | null | undefined)
	allow_map?: (boolean | null | undefined)
	is_app_disabled?: (boolean | null | undefined)
}

export interface ChatCreateChannelRequest {
	chain_uid: string
	name: string
	color: string
}

export interface ChatCreateChannelResponse {
	chat_channel: string
}

export interface ChatDeleteChannelRequest {
	chain_uid: string
	channel_id: string
}

export interface ChatJoinChannelsRequest {
	chain_uid: string
}

export interface ChatPatchUserRequest {
	chain_uid: string
}

export interface ChatPatchUserResponse {
	chat_team: string
	chat_user_id: string
	chat_pass: string
	chat_user_name: string
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
	price_currency?: (string | null | undefined)
	price_type?: (EventPriceType | null | undefined)
	link: string
	date: string
	date_end?: (string | null | undefined)
	genders: string[]
	chain_uid?: (string | null | undefined)
	user_uid?: (string | null | undefined)
	user_name?: (string | null | undefined)
	user_email?: (string | null | undefined)
	image_url: string
	chain_name?: (string | null | undefined)
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
	date_end?: (string | null | undefined)
	genders: string[]
	chain_uid?: (string | null | undefined)
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
	name?: (string | null | undefined)
	description?: (string | null | undefined)
	address?: (string | null | undefined)
	link?: (string | null | undefined)
	price_value?: (number | null | undefined)
	price_currency?: (string | null | undefined)
	price_type?: (EventPriceType | null | undefined)
	latitude?: (number | null | undefined)
	longitude?: (number | null | undefined)
	date?: (string | null | undefined)
	date_end?: (string | null | undefined)
	genders?: (string[] | null | undefined)
	image_url?: (string | null | undefined)
	image_delete_url?: (string | null | undefined)
	chain_uid?: (string | null | undefined)
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
	description: string
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
	email?: (string | null | undefined)
	is_email_verified: boolean
	is_root_admin: boolean
	paused_until?: (string | null | undefined)
	name: string
	phone_number: string
	address: string
	sizes: string[]
	chains: UserChain[]
	i18n: string
	accepted_toh?: (boolean | null | undefined)
	accepted_dpa?: (boolean | null | undefined)
	notification_chain_uids?: (string[] | null | undefined)
	chat_id?: (string | null | undefined)
	chat_user_name?: (string | null | undefined)
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
	chain_uid?: (string | null | undefined)
	user_uid?: (string | null | undefined)
	name?: (string | null | undefined)
	phone_number?: (string | null | undefined)
	newsletter?: (boolean | null | undefined)
	paused_until?: (string | null | undefined)
	chain_paused?: (boolean | null | undefined)
	sizes?: (string[] | null | undefined)
	address?: (string | null | undefined)
	i18n?: (string | null | undefined)
	latitude?: (number | null | undefined)
	longitude?: (number | null | undefined)
	accepted_legal?: (boolean | null | undefined)
}

type _EventPriceTypeValue = Record<string, EventPriceType>

type errEventPriceTypeNilPtr = Record<string, any>

