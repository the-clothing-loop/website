import { PropsWithChildren } from "react";

export function TwoColumnLayout({
  children,
  img,
}: PropsWithChildren<{ img: string; vcenter?: boolean }>) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 flex justify-center md:justify-end pr-5 mb-6 md:mb-0">
        <img
          src={img}
          alt="form-img"
          className="max-md:w-60 max-w-[600px] max-h-[600px]"
        />
      </div>
      <div className="md:w-1/2 pl-5 flex items-center pr-10">
        <div className="md:max-w-[600px] w-full">{children}</div>
      </div>
    </div>
  );
}

export function OneColumnLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="container">
      <div className="flex">
        <div className="w-1/2">{children}</div>
      </div>
    </div>
  );
}
