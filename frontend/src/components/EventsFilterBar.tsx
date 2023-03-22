import { FormEvent, useRef } from "react";
import { useTranslation } from "react-i18next";

import useForm from "../util/form.hooks";
import CategoriesDropdown from "../components/CategoriesDropdown";
import DistanceDropdown from "../components/DistanceDropdown";
import WhenDropdown from "../components/WhenDropdown";

export interface SearchValues {
  genders: string[];
  date: string[];
  distance: string[];
}

interface Props {
  initialValues?: SearchValues;
  onSearch: (search: SearchValues) => void;
}

  
export default function EventsFilterBar(props: Props) {
  const { t } = useTranslation();

  const [values, setValue] = useForm<SearchValues>({
    genders: [] as string[],
    distance: [] as string[],
    date: [] as string[],
    ...props.initialValues,
  });
  let refSubmit = useRef<any>();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    props.onSearch(values);
  }

  return (
    <form className="flex flex-col md:flex-row" onSubmit={handleSubmit}>
      <div className="mb-8">
        <CategoriesDropdown
          className="w-[150px] md:w-[170px] mr-4 md:mr-8"
          selectedGenders={values.genders}
          handleChange={(gs) => setValue("genders", gs)}
        />
        <WhenDropdown
          className="w-[150px] md:w-[170px] mr-4 md:mr-8"
          selectedDate={values.date}
          handleChange={(date) => setValue("date", date)}
        />
      </div>
      <button type="submit" className="btn btn-primary" ref={refSubmit}>
        <span className="hidden sm:inline">{t("search")}</span>
        <span className="sm:hidden inline feather feather-search"></span>
      </button>
    </form>
  );
}
