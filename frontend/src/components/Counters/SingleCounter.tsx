import { CSSProperties, FC, useEffect, useState } from "react";

interface IProps {
  end: number;
  step: number;
}

const SingleCount: FC<IProps> = ({ end, step }: IProps) => {
  const [state, setState] = useState(0);

  const counter = (
    val: number,
    end: number,
    setter: (value: number) => void,
    step: number
  ) => {
    if (val > end) {
      setter(end);
      return;
    }
    setter(val);
    setTimeout(() => {
      counter(val + step, end, setter, step);
    }, 40);
  };

  useEffect(() => {
    counter(0, end, setState, step);
  }, []);

  return <div>{state}</div>;
};

export default SingleCount;
