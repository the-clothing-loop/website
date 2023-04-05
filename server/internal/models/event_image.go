package models

import (
	"bytes"
	"crypto/md5"
	"fmt"
	"io"

	"github.com/disintegration/imaging"
	"gorm.io/gorm"
)

type EventImage struct {
	ID    uint
	MD5   string `gorm:"unique"`
	Blob  []byte
	Event Event
}

func EventImageAdd(db *gorm.DB, event *Event, r io.Reader) error {
	eventOriginalImageID := event.EventImageID

	// Resize the image
	img, err := imaging.Decode(r)
	if err != nil {
		return err
	}

	imgNRGBA := imaging.Thumbnail(img, 400, 300, imaging.Lanczos)
	if err != nil {
		return err
	}

	buf := new(bytes.Buffer)
	err = imaging.Encode(buf, imgNRGBA, imaging.JPEG, imaging.JPEGQuality(80))
	if err != nil {
		return err
	}

	imgBytes := buf.Bytes()

	// Check if the image already exists
	md5sum := fmt.Sprintf("%x", md5.Sum(imgBytes))

	exists := uint(0)
	db.Raw(`SELECT id FROM event_images WHERE md5 = ? LIMIT 1`, md5sum).Scan(&exists)

	if exists != 0 {
		return db.Exec(`UPDATE events SET event_image_id = ? WHERE id = ?`, exists, event.ID).Error
	}

	// Place the image in the database
	eventImage := EventImage{
		MD5:  md5sum,
		Blob: imgBytes,
	}
	tx := db.Begin()
	err = tx.Create(&eventImage).Error
	if err != nil {
		tx.Rollback()
		return err
	}
	err = tx.Exec(`UPDATE events SET event_image_id = ? WHERE id = ?`, eventImage.ID, event.ID).Error
	if err != nil {
		tx.Rollback()
		return err
	}
	tx.Commit()

	// Delete the original image if it is orphaned
	count := -1
	err = db.Raw(`SELECT COUNT(id) FROM events WHERE event_image_id = ?`, eventOriginalImageID).Scan(&count).Error
	if err != nil {
		return err
	}

	if count == 0 {
		err = db.Exec(`DELETE FROM event_images WHERE id = ?`, eventOriginalImageID).Error
		if err != nil {
			return err
		}
	}

	return nil
}

func EventImageDelete(db *gorm.DB, event *Event) error {
	count := -1
	err := db.Raw(`SELECT COUNT(id) FROM events WHERE event_image_id = ? AND id != ?`, event.EventImageID, event.ID).Scan(&count).Error
	if err != nil {
		return err
	}

	tx := db.Begin()
	err = tx.Exec(`UPDATE events SET event_image_id = NULL WHERE id = ?`, event.ID).Error
	if err != nil {
		tx.Rollback()
		return err
	}
	if count == 0 {
		err = tx.Exec(`DELETE FROM event_images WHERE id = ?`, event.EventImageID).Error
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	tx.Commit()

	return nil
}
