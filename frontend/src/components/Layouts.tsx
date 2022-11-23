import { PropsWithChildren } from "react";

export function TwoColumnLayout({
  children,
  img,
}: PropsWithChildren<{ img: string }>) {
  return (
    <div className="flex">
      <div className="w-1/2 flex justify-end pr-10">
        <img src={img} alt="form-img" className="max-w-[600px] max-h-[600px]" />
      </div>
      <div className="1/2">
        <div className="max-w-[600px] w-full">{children}</div>
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
