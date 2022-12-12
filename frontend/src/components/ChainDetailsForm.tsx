import { FormEvent, useState } from "react";
import destination from "@turf/destination";
import ReactMapGL, {
  SVGOverlay,
  FlyToInterpolator,
  MapEvent,
} from "react-map-gl";
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
import { useHistory } from "react-router";
import { useContext } from "react";
import { ToastContext } from "../providers/ToastProvider";

const accessToken = process.env.REACT_APP_MAPBOX_KEY || "";

interface IProps {
  onSubmit: (values: RegisterChainForm) => void;
  submitted?: boolean;
  submitError?: string;
  initialValues?: RegisterChainForm;
  showBack?: boolean;
}

export type RegisterChainForm = Omit<
  RequestRegisterChain,
  "open_to_new_members"
>;

export default function ChainDetailsForm({
  onSubmit,
  submitError,
  initialValues,
  submitted,
  showBack,
}: IProps) {
  const { t } = useTranslation();
  const { addToastError } = useContext(ToastContext);
  const history = useHistory();

  const [viewport, setViewport] = useState<IViewPort>({
    longitude: initialValues ? initialValues.longitude : 17.2283,
    latitude: initialValues ? initialValues.latitude : 26.3351,
    width: "40vw",
    height: "40vh",
    zoom: initialValues?.latitude && initialValues?.longitude ? 10 : 1,
  });

  const [values, setValue, setValues] = useForm<RegisterChainForm>({
    name: "",
    description: "",
    address: "",
    radius: 3,
    genders: [],
    sizes: [],
    longitude: 0,
    latitude: 0,
    ...initialValues,
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

  function handleGeolocationResult(e: {
    result: { center: [number, number] };
  }) {
    flyToLocation(...e.result.center);
  }

  async function getPlaceName(
    longitude: number,
    latitude: number
  ): Promise<string> {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&cachebuster=1618224066302&autocomplete=true&types=locality%2Cplace`
    );
    const data = await response.json();
    return data.features[0]?.place_name || "";
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!values.genders?.length) {
      addToastError(t("required") + ": " + t("categories"));
      return;
    }
    if (!values.sizes?.length) {
      addToastError(t("required") + ": " + t("sizes"));
      return;
    }

    (async () => {
      values.address = await getPlaceName(values.longitude, values.latitude);
      console.log("getPlaceName", values.address);

      if (values.address.length < 6) {
        addToastError(t("required") + ": " + t("address"));
        return;
      }

      onSubmit(values);
    })();
  }

  function handleMapClick(e: MapEvent) {
    const el = e.srcEvent.target as HTMLElement | undefined;
    if (el?.className.toString().includes("mapboxgl-ctrl-geocoder")) {
      // ignore clicks on geocoding search bar, which is on top of map
      return;
    }

    setValue("longitude", e.lngLat[0]);
    setValue("latitude", e.lngLat[1]);
    flyToLocation(e.lngLat[0], e.lngLat[1]);
  }

  function redrawLoop({ project }: { project: any }) {
    if (!values.longitude || !values.latitude) {
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
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 md:pr-4">
        <div className="aspect-square mb-6 md:mb-0">
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
      <div className="md:w-1/2 md:pl-4">
        <form onSubmit={handleSubmit}>
          <p className="mb-2">{t("clickToSetLoopLocation")}</p>
          <TextForm
            classes={{ root: "" }}
            required
            min={3}
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

          <label className="form-control relative w-full mb-4">
            <div className="label">
              <span className="label-text">{t("description")}</span>
            </div>
            <textarea
              className="textarea textarea-secondary w-full"
              name="description"
              cols={3}
              value={values.description}
              onChange={(e) => setValue("description", e.target.value)}
            />
            <PopoverOnHover
              message={t("optionalFieldTypeAnything")}
              className="absolute top-0 -right-2"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4 items-end mb-6">
            <CategoriesDropdown
              className="dropdown-top"
              selectedGenders={values.genders || []}
              handleChange={handleCategoriesChange}
            />
            <div>
              <div className="flex justify-end -mr-2 -mt-3">
                <PopoverOnHover
                  message={t("mixedBagsUsuallyWorkBestThereforeWeRecommentTo")}
                />
              </div>
              <SizesDropdown
                className="dropdown-top"
                filteredGenders={
                  values.genders?.length
                    ? values.genders
                    : [Genders.children, Genders.women, Genders.men]
                }
                selectedSizes={values.sizes || []}
                handleChange={(v) => setValue("sizes", v)}
              />
            </div>
          </div>

          <div className="flex flex-row">
            {showBack && (
              <button
                type="button"
                className="btn btn-secondary btn-outline mr-4"
                onClick={() => history.goBack()}
              >
                {t("back")}
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {t("submit")}
              <span className="feather feather-arrow-right ml-4"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
