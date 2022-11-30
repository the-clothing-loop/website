import { PropsWithChildren } from "react";

export function TwoColumnLayout({
  children,
  img,
}: PropsWithChildren<{ img: string; vcenter?: boolean }>) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 flex justify-center md:justify-end px-4 md:pr-5 md:pl-0 mb-6 md:mb-0">
        <img
          src={img}
          alt="form-img"
          className="max-md:w-60 max-w-[600px] max-h-[600px]"
        />
      </div>
      <div className="md:w-1/2 flex items-center px-4 md:pl-5 md:pr-10">
        <div className="md:max-w-[600px] w-full">{children}</div>
      </div>
    </div>
  );
}
