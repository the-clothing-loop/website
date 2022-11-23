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
      className={`tooltip tooltip-bottom focus:tooltip-open btn-sm btn-circle btn-ghost flex items-center justify-center z-10 ${
        className || ""
      }`}
      aria-label={message}
      data-tip={message}
    >
      <span className="feather feather-help-circle text-lg" />
    </div>
  );
}
