package sharedtypes

type ImageUploadResponse struct {
	Delete    string `json:"delete"`
	Thumbnail string `json:"thumbnail"`
	Image     string `json:"image"`
}
