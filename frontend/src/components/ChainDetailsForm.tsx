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
import { RequestRegisterChain } from "../api/login";
import { Genders, Sizes } from "../api/enums";
import useForm from "../util/form.hooks";

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

  const [values, setValue, setValues] = useForm<RegisterChainForm>({
    name: "",
    description: "",
    radius: 3,
    genders: [],
    sizes: [],
    longitude: 0,
    latitude: 0,
  });

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
    setValue("longitude", event.lngLat[0]);
    setValue("latitude", event.lngLat[1]);
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
    setValue("genders", selectedGenders as Genders[]);
    // potentially remove some sizes if their parent category has been deselected
    const filteredSizes = (values.sizes || []).filter(
      (size) =>
        selectedGenders.filter((gender) =>
          categories[gender as Genders].includes(size as Sizes)
        ).length > 0
    );
    setValue("sizes", filteredSizes);
  }
  return (
    <div className="flex flex-row">
      <div className="w-1/2 pr-4">
        <div className="aspect-square">
          <ReactMapGL
            mapboxApiAccessToken={accessToken}
            mapStyle="mapbox://styles/mapbox/light-v10"
            {...viewport}
            onViewportChange={(newView: IViewPort) => setViewport(newView)}
            onClick={handleMapClick}
            getCursor={() => "pointer"}
            className="cursor-pointer shadow-lg"
            width="100%"
            height="100%"
          >
            <Geocoding
              onResult={handleGeolocationResult}
              className="absolute top-5 left-5"
            />
            {values.longitude !== null && values.latitude !== null ? (
              <SVGOverlay redraw={redrawLoop} />
            ) : null}
          </ReactMapGL>
        </div>
      </div>
      <div className="w-1/2 pl-4">
        <form noValidate>
          <p className="mb-2">{t("clickToSetLoopLocation")}</p>
          <TextForm
            classes={{ root: "" }}
            required
            label={t("loopName")}
            name="name"
            type="text"
            value={values.name}
            onChange={(e) => setValue("name", e.target.value)}
            info={t("upToYouUsuallyTheGeopraphic")}
          />

          <TextForm
            type="number"
            required
            label={t("radius")}
            name="radius"
            value={values.radius}
            onChange={(e) => setValue("radius", e.target.valueAsNumber)}
            step="0.1"
            info={t("decideOnTheAreaYourLoopWillBeActiveIn")}
          />

          <TextForm
            type="text"
            label={t("description")}
            name="description"
            value={values.description}
            onChange={(e) => setValue("description", e.target.value)}
            classes={{ root: "mb-4 w-full max-w-xs" }}
            info={t("optionalFieldTypeAnything")}
          />

          <div className="mb-2 w-full max-w-xs">
            <div className="float-right -mr-2 -mt-2">
              <PopoverOnHover
                message={t("mixedBagsUsuallyWorkBestThereforeWeRecommentTo")}
              />
            </div>
            <CategoriesDropdown
              selectedGenders={values.genders || []}
              handleChange={handleCategoriesChange}
            />
          </div>

          <div className="mb-6 w-full max-w-xs">
            <SizesDropdown
              filteredGenders={
                values.genders?.length
                  ? values.genders
                  : [Genders.children, Genders.women, Genders.men]
              }
              selectedSizes={values.sizes || []}
              handleChange={(v) => setValue("sizes", v)}
            />
          </div>

          <div className="flex flex-row">
            <button type="submit" className="btn btn-primary btn-outline">
              {t("back")}
            </button>
            <button type="submit" className="btn btn-primary ml-4">
              {t("submit")}
              <span className="feather feather-arrow-right ml-4"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
