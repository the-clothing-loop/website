package sharedtypes

type RouteOrderSet struct {
	ChainUID   string   `json:"chain_uid" binding:"required"`
	RouteOrder []string `json:"route_order" binding:"required"`
}

type RouteCoordinatesGetResponseItem struct {
	UserUID    string  `json:"user_uid"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	RouteOrder int     `json:"route_order"`
}
