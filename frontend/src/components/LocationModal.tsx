import { useEffect, useRef, useState, useContext, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import type * as GeoJSONTypes from "geojson";

import { TextForm } from "./FormFields";
import useForm from "../util/form.hooks";
import { ToastContext } from "../providers/ToastProvider";
import { circleRadiusKm } from "../util/maps";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY || "";

interface Props {
  longitude?: number;
  latitude?: number;
  setValues: (values: LocationValues) => void;
}

type GeoJSONPoint = GeoJSONTypes.FeatureCollection<
  GeoJSONTypes.Geometry,
  { radius: number }
>;

interface Point {
  longitude: number;
  latitude: number;
  radius: number;
}
export interface LocationValues {
  radius: number;
  longitude: number;
  latitude: number;
}

function mapToGeoJSON(point: Point | undefined): GeoJSONPoint {
  return {
    type: "FeatureCollection",
    features: point
      ? [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [point.longitude, point.latitude],
            },
            properties: {
              radius: circleRadiusKm(point.radius * 1000, point.latitude),
            },
          },
        ]
      : [],
  };
}

export default function LocationModal({
  setValues,
  longitude = 4.8998197,
  latitude = 52.3673008,
}: Props) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);

  const mapRef = useRef<any>();
  const [map, setMap] = useState<mapboxgl.Map>();
  const [values, setValue] = useForm<LocationValues>({
    radius: 3,
    longitude,
    latitude,
  });

  useEffect(() => {
    const hasCenter = !!(values.longitude && values.latitude);
    const _map = new mapboxgl.Map({
      accessToken: MAPBOX_TOKEN,
      container: mapRef.current,
      projection: { name: "mercator" },
      zoom: 10,
      minZoom: 1,
      maxZoom: 13,
      center: (hasCenter
        ? [values.longitude, values.latitude]
        : [4.8998197, 52.3673008]) as mapboxgl.LngLatLike,
      style: "mapbox://styles/mapbox/light-v11",
    });
    _map.addControl(new MapboxGeocoder({ accessToken: MAPBOX_TOKEN }));

    _map.on("load", () => {
      _map.addSource("source", {
        type: "geojson",
        data: mapToGeoJSON(
          hasCenter
            ? {
                longitude: values.longitude,
                latitude: values.latitude,
                radius: values.radius,
              }
            : undefined
        ),
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 30,
      });

      _map.addLayer({
        id: "single",
        type: "circle",
        source: "source",
        paint: {
          "circle-color": ["rgba", 240, 196, 73, 0.4], // #f0c449
          "circle-radius": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            0,
            0,
            20,
            ["get", "radius"],
          ],
          "circle-stroke-width": 0,
          "circle-blur": 0,
        },
      });

      const marker = new mapboxgl.Marker({
        color: "teal",
        draggable: false,
      });

      _map.on("click", (e) => {
        const el = e.originalEvent.target as HTMLElement | undefined;

        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        marker.addTo(_map);

        if (el?.classList.contains("mapboxgl-ctrl-geocoder")) {
          // ignore clicks on geocoding search bar, which is on top of map
          return;
        }

        setValue("longitude", e.lngLat.lng);
        setValue("latitude", e.lngLat.lat);
        setValues({
          radius: values.radius,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        });
      });
    });

    setMap(_map);
    return () => {
      _map.remove();
      setMap(undefined);
    };
  }, []);

  useEffect(() => {
    let radius = values.radius;
    if (radius > 40 || radius <= 0) radius = 99999999;

    (map?.getSource("source") as mapboxgl.GeoJSONSource)?.setData(
      mapToGeoJSON({
        longitude: values.longitude,
        latitude: values.latitude,
        radius: radius,
      })
    );
  }, [values.longitude, values.latitude, values.radius]);

  let isAnyDistance = values.radius > 40 || values.radius <= 0;
  return (
    <div className="w-full mx-auto mb-6">
      <div className="aspect-square cursor-pointer" ref={mapRef} />
      <div className="w-full">
        <p className="mb-2 text-sm">{t("clickMap")}</p>
        <input
          name="range"
          type="range"
          min={-1}
          max={41}
          step={0.1}
          defaultValue={3}
          onChange={(e) => setValue("radius", e.target.valueAsNumber)}
          className="w-full h-2 bg-teal rounded-lg appearance-none cursor-pointer"
          required
        />
        <div className="relative">
          <TextForm
            type="number"
            required
            label={t("radius")}
            name="radius"
            value={values.radius}
            onChange={(e) => setValue("radius", e.target.valueAsNumber)}
            step="0.1"
            info={t("setLocationAndRadius")}
          />
          <div
            className={`absolute bg-white bottom-2 p-1 left-2 ${
              isAnyDistance ? "" : "hidden"
            }`}
          >
            {t("anyDistance")}
          </div>
        </div>
      </div>
    </div>
  );
}
