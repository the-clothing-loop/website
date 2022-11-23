import { useState } from "react";

export function useDropdown() {
  const [open, setOpenState] = useState(false);
  const setOpen = (v: boolean) => {
    if (!v) {
      //@ts-ignore
      document.activeElement.blur();
    }

    setOpenState(v);
  };
  const toggle = () => setOpen(!open);
  return {
    open,
    setOpen,
    toggle,
  };
}

export function useDropdownCheckBox<O extends string | number>(props: {
  selected: O[];
  handleChange: (o: O[]) => void;
}) {
  const { open, setOpen, toggle } = useDropdown();

  const change = (value: O) => {
    if (props.selected.find((o) => o === value)) {
      props.handleChange(props.selected.filter((o) => o !== value));
    } else {
      props.handleChange([...props.selected, value]);
    }
  };

  return {
    open,
    setOpen,
    toggle,
    change,
  };
}

export function useDropdownRadio<O extends string | number>(props: {
  selected: O;
  handleChange: (o: O) => void;
}) {
  const { open, setOpen, toggle } = useDropdown();

  const change = (value: O) => {
    if (props.selected !== value) {
      props.handleChange(value);
    }
  };

  return {
    open,
    setOpen,
    toggle,
    change,
  };
}
