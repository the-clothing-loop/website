import { useState } from "react";

interface IProps {
  message: string;
}

const PopoverOnHover: React.FC<IProps> = ({ message }: IProps) => {
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
      className="tw-tooltip tw-tooltip-bottom tw-btn tw-btn-circle tw-btn-ghost"
      aria-label={message}
      data-tip={message}
    >
      <span className="feather feather-help-circle" />
    </div>
  );
};

export default PopoverOnHover;
