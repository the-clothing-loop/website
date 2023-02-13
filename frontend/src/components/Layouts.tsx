import { FormatFunction } from "i18next";
import { PropsWithChildren } from "react";

export function TwoColumnLayout({
  children,
  t,
  ...props
}: PropsWithChildren<{
  t: FormatFunction;
  img: string;
  alt: string;
  credit?: string;
}>) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 flex justify-center md:justify-end px-4 md:pr-5 md:pl-0 mb-6 md:mb-0">
        <div className="max-md:w-60 max-w-[600px] max-h-[600px]">
          <img src={props.img} alt={props.alt} />
          {props.credit ? (
            <span className="text-sm my-1">
              {t("photo")}: {props.credit}
            </span>
          ) : null}
        </div>
      </div>
      <div className="md:w-1/2 flex items-center px-4 md:pl-5 md:pr-10">
        <div className="md:max-w-[600px] w-full">{children}</div>
      </div>
    </div>
  );
}
