import * as React from "react";
import { useEffect, useState } from "react";

interface IProps {
  end: number;
  step: number;
}

const SingleCount: React.FC<IProps> = ({ end, step }: IProps) => {
  const [state, setState] = useState(0);

  const counter = (
    val: number,
    end: number,
    setter: (value: number) => void,
    step: number
  ) => {
    if (val > end) return;
    setter(val);
    setTimeout(() => {
      counter(val + step, end, setter, step);
    });
  };

  useEffect(() => {
    counter(0, end, setState, step);
  }, []);

  return (
    <div>
      <h1
        style={{
          fontFamily: "Playfair Display",
          color: "transparent",
          WebkitTextStroke: "1px white",
          fontSize: "78px",
          margin: "1% 0",
        }}
      >
        {state}
      </h1>
    </div>
  );
};

export default SingleCount;
