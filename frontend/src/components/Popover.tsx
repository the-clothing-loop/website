import { useState } from "react";

interface IProps {
  message: string;
  className?: string;
}

export default function PopoverOnHover({ message, className }: IProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div
      tabIndex={0}
      className={`tw-tooltip tw-tooltip-bottom focus:tw-tooltip-open tw-btn-sm tw-btn-circle tw-btn-ghost tw-flex tw-items-center tw-justify-center tw-z-10 ${
        className || ""
      }`}
      aria-label={message}
      data-tip={message}
    >
      <span className="feather feather-help-circle tw-text-lg" />
    </div>
  );
}
