import { useState } from "react";
interface Props<O> {
  selected: O[];
  handleChange: (o: O[]) => void;
}

export default function useDropdown<O extends string | number>(
  props: Props<O>
) {
  const [open, setOpenState] = useState(false);
  const setOpen = (v: boolean) => {
    if (!v) {
      //@ts-ignore
      document.activeElement.blur();
    }

    setOpenState(v);
  };
  const toggle = () => setOpen(!open);

  const handleRadio = (value: O) => {
    if (props.selected.find((o) => o == value)) {
      props.handleChange([]);
    } else {
      props.handleChange([value]);
    }
  };
  const handleCheckbox = (value: O) => {
    if (props.selected.find((o) => o == value)) {
      props.handleChange(props.selected.filter((o) => o != value));
    } else {
      props.handleChange([...props.selected, value]);
    }
  };

  return {
    open,
    setOpen,
    toggle,
    handleCheckbox,
    handleRadio,
  };
}
