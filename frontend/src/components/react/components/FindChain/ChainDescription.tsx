import { useState, Fragment } from "react";

interface Props {
  description: string;
}
export default function ChainDescription(props: Props) {
  const [isOpenDesc, setIsOpenDesc] = useState(false);
  function handleClickShortenedDesc() {
    setIsOpenDesc((s) => !s);
  }
  return (
    <div className="mb-3">
      <p
        onClick={
          isOpenDesc
            ? undefined
            : () => {
                setIsOpenDesc(true);
              }
        }
        className={"text-sm break-words"
          .concat(
            props.description.length > 200
              ? " overflow-hidden max-h-12 relative before:absolute before:h-8 before:w-full before:bg-gradient-to-t before:from-black/10 before:to-transparent before:bottom-0"
              : "",
          )
          .concat(
            props.description.length > 200 && isOpenDesc
              ? " max-h-fit before:hidden"
              : " before:block cursor-pointer",
          )}
        tabIndex={0}
      >
        {props.description.split("\n").map((s, i) => {
          if (i === 0) return s;

          return (
            <Fragment key={i}>
              <br />
              {s}
            </Fragment>
          );
        })}
      </p>
      {props.description.length > 200 ? (
        <button
          type="button"
          aria-label="expand"
          className={"sticky bottom-0 btn btn-xs btn-secondary feather ".concat(
            isOpenDesc ? "feather-chevron-up" : "feather-chevron-down",
          )}
          onClick={handleClickShortenedDesc}
        ></button>
      ) : null}
    </div>
  );
}
