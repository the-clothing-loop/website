import { useState } from "react";

interface IProps {
  message: string;
  className?: string;
}

export default function PopoverOnHover({ message, className }: IProps) {
  return (
    <div
      tabIndex={0}
      className={`tooltip focus:tooltip-open btn-sm btn-circle btn-ghost flex items-center justify-center z-20 ${
        className || ""
      }`}
      aria-label={message}
      data-tip={message}
    >
      <span className="feather feather-help-circle text-lg" />
    </div>
  );
}
