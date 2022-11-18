import { useState } from "react";
import destination from "@turf/destination";
import ReactMapGL, { SVGOverlay, FlyToInterpolator } from "react-map-gl";
import { useTranslation } from "react-i18next";

import categories from "../util/categories";
import { IViewPort } from "../types";
import Geocoding from "../pages/Geocoding";
import { TextForm } from "./FormFields";
import PopoverOnHover from "./Popover";
import SizesDropdown from "../components/SizesDropdown";
import CategoriesDropdown from "../components/CategoriesDropdown";
import { Chain } from "../api/types";
import { RequestRegisterChain } from "../api/login";
import { Genders, Sizes } from "../api/enums";

const accessToken = process.env.REACT_APP_MAPBOX_KEY || "";

interface IProps {
  onSubmit: (values: RegisterChainForm) => void;
  submitted?: boolean;
  submitError?: string;
  initialValues?: RegisterChainForm;
}

export type RegisterChainForm = Omit<
  RequestRegisterChain,
  "address" | "open_to_new_members"
>;

export default function ChainDetailsForm({
  onSubmit,
  submitError,
  initialValues,
  submitted,
}: IProps) {
  const { t } = useTranslation();

  const [viewport, setViewport] = useState<IViewPort>({
    longitude: initialValues ? initialValues.longitude : 0,
    latitude: initialValues ? initialValues.latitude : 0,
    width: "40vw",
    height: "40vh",
    zoom: initialValues ? 10 : 1,
  });

  const [values, setValues] = useState<RegisterChainForm>({
    name: "",
    description: "",
    radius: 3,
    genders: [],
    sizes: [],
    longitude: 0,
    latitude: 0,
  });
  function setFieldValue<K = keyof RegisterChainForm>(key: K, value: any) {
    setValues((state) => ({
      ...state,
      [key as any]: value,
    }));
  }

  function flyToLocation(longitude: number, latitude: number) {
    setViewport({
      ...viewport,
      longitude: longitude,
      latitude: latitude,
      zoom: 10,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
    });
  }

  function handleGeolocationResult({
    result: { center },
  }: {
    result: { center: [number, number] };
  }) {
    flyToLocation(...center);
  }

  async function getPlaceName(longitude: number, latitude: number) {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    );
    const data = await response.json();
    return data.features[0].place_name;
  }

  async function onSubmitWrapper(values: any) {
    values.address = await getPlaceName(values.longitude, values.latitude);
    return onSubmit(values);
  }

  function handleMapClick(event: any) {
    const targetClass = String(event.srcEvent.target?.className);
    if (targetClass.includes("mapboxgl-ctrl-geocoder")) {
      // ignore clicks on geocoding search bar, which is on top of map
      return;
    }
    setFieldValue("longitude", event.lngLat[0]);
    setFieldValue("latitude", event.lngLat[1]);
    flyToLocation(event.lngLat[0], event.lngLat[1]);
  }

  function redrawLoop({ project }: { project: any }) {
    if (values.longitude === null || values.latitude === null) {
      return;
    }
    const [centerX, centerY] = project([values.longitude, values.latitude]);
    // get the coordinates of a point the right distance away from center
    const boundaryPoint = destination(
      [values.longitude, values.latitude],
      values.radius,
      0, // due north
      { units: "kilometers" }
    );
    const [_, boundaryY] = project(boundaryPoint.geometry.coordinates);
    const projectedRadius = centerY - boundaryY;

    return (
      <>
        <defs>
          <radialGradient id="feather">
            <stop offset="0%" stopColor="#F7C86F" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#F7C86F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F7C86F" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx={centerX}
          cy={centerY}
          r={projectedRadius}
          fill="url(#feather)"
        />
        ;
      </>
    );
  }
  function handleCategoriesChange(selectedGenders: string[]) {
    setFieldValue("genders", selectedGenders as Genders[]);
    // potentially remove some sizes if their parent category has been deselected
    const filteredSizes = (values.sizes || []).filter(
      (size) =>
        selectedGenders.filter((gender) =>
          categories[gender as Genders].includes(size as Sizes)
        ).length > 0
    );
    setFieldValue("sizes", filteredSizes);
  }
  return (
    <div className="tw-flex tw-flex-row">
      <div className="tw-w-1/2">
        <ReactMapGL
          mapboxApiAccessToken={accessToken}
          mapStyle="mapbox://styles/mapbox/light-v10"
          {...viewport}
          onViewportChange={(newView: IViewPort) => setViewport(newView)}
          onClick={handleMapClick}
          getCursor={() => "pointer"}
          className="tw-cursor-pointer tw-shadow-lg"
          width="100%"
        >
          <Geocoding
            onResult={handleGeolocationResult}
            className="tw-absolute tw-top-5 tw-left-5"
          />
          {values.longitude !== null && values.latitude !== null ? (
            <SVGOverlay redraw={redrawLoop} />
          ) : null}
        </ReactMapGL>
      </div>
      <div className="tw-w-1/2">
        <form noValidate>
          <p className="formSubtitle">{t("clickToSetLoopLocation")}</p>

          <TextForm
            required
            label={t("loopName")}
            name="name"
            type="text"
            value={values.name}
          />

          <PopoverOnHover message={t("upToYouUsuallyTheGeopraphic")} />

          <TextForm
            type="text"
            required
            label={t("radius")}
            name="radius"
            value={values.radius}
            step={0.1}
          />
          <PopoverOnHover
            message={t("decideOnTheAreaYourLoopWillBeActiveIn")}
          />

          <TextForm
            type="text"
            label={t("description")}
            name="description"
            value={values.description}
          />
          <PopoverOnHover message={t("optionalFieldTypeAnything")} />

          <CategoriesDropdown
            selectedGenders={values.genders || []}
            handleChange={handleCategoriesChange}
          />

          <SizesDropdown
            filteredGenders={values.genders || []}
            selectedSizes={values.sizes || []}
            handleChange={(val) => setFieldValue("sizes", val)}
          />
          <PopoverOnHover
            message={t("mixedBagsUsuallyWorkBestThereforeWeRecommentTo")}
          />

          <div className="tw-flex tw-flex-row">
            <button
              type="submit"
              className="tw-btn tw-btn-primary tw-btn-outline"
            >
              {t("back")}
            </button>
            <button type="submit" className="tw-btn tw-btn-primary tw-ml-4">
              {t("submit")}
              <span className="feather feather-arrow-right tw-ml-4"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
