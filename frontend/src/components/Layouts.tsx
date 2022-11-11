import { PropsWithChildren } from "react";

export function TwoColumnLayout({
  children,
  img,
}: PropsWithChildren<{ img: string }>) {
  return (
    <div className="tw-flex">
      <div className="tw-w-1/2 tw-flex tw-justify-end tw-pr-10">
        <img
          src={img}
          alt="form-img"
          className="tw-max-w-[600px] tw-max-h-[600px]"
        />
      </div>
      <div className="tw-1/2">
        <div className="tw-max-w-[600px] tw-w-full">{children}</div>
      </div>
    </div>
  );
}

export function OneColumnLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="tw-container">
      <div className="tw-flex">
        <div className="tw-w-1/2">{children}</div>
      </div>
    </div>
  );
}
