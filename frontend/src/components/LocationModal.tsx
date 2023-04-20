import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useContext,
  Fragment,
} from "react";
import { useHistory } from "react-router";
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
  longitude: number;
  latitude: number;
  showRadius?: boolean;
  btnText: string;
  onSubmit: (values: LocationValues) => void;
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
  address: string;
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
  onSubmit,
  longitude,
  latitude,
  btnText,
  showRadius = false,
}: Props) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);

  const mapRef = useRef<any>();
  const [map, setMap] = useState<mapboxgl.Map>();
  const [values, setValue] = useForm<LocationValues>({
    address: "",
    radius: 3,
    longitude: 0,
    latitude: 0,
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
      });
    });

    setMap(_map);
    return () => {
      _map.remove();
      setMap(undefined);
    };
  }, []);

  useEffect(() => {
    (map?.getSource("source") as mapboxgl.GeoJSONSource)?.setData(
      mapToGeoJSON({
        longitude: values.longitude,
        latitude: values.latitude,
        radius: values.radius,
      })
    );
  }, [values.longitude, values.latitude, values.radius]);

  async function getPlaceName(
    longitude: number,
    latitude: number
  ): Promise<string> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    );
    const data = await response.json();
    return data.features[0]?.place_name || "";
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    (async () => {
      if (!(values.longitude && values.latitude)) {
        addToastError(t("required") + ": " + t("loopLocation"), 400);
        return;
      }
      values.address = await getPlaceName(values.longitude, values.latitude);
      if (!(values.longitude && values.latitude)) {
        console.error("getPlaceName", values.address);
        addToastError(t("required") + ": " + t("loopLocation"), 500);
        return;
      }
      onSubmit(values);
    })();
  }

  return (
    <>
      <button className="btn btn-primary">{btnText}</button>
      <div className="w-full mx-auto">
        <div className="aspect-square cursor-pointer" ref={mapRef} />
        <div className="w-full">
          <form onSubmit={handleSubmit} id="location-form">
            <p className="mb-2 text-sm">{t("clickMap")}</p>
            <input
              name="range"
              type="range"
              min={1}
              step={0.1}
              defaultValue={3}
              onChange={(e) => setValue("radius", e.target.valueAsNumber)}
              className="w-full h-2 bg-teal rounded-lg appearance-none cursor-pointer"
              required
            />
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
            <button className="btn btn-primary my-2" id="submit-location">
              {t("submit")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
