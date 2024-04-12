import { type FC, useEffect, useState } from "react";

interface IProps {
  end: number;
  step: number;
}

const SingleCount: FC<IProps> = ({ end, step }: IProps) => {
  const [state, setState] = useState(0);

  function counter() {
    setState((s) => {
      if (s + step > end) return end;
      setTimeout(() => {
        counter();
      }, 40);
      return s + step;
    });
  }

  useEffect(() => {
    counter();
  }, []);

  return new Intl.NumberFormat().format(state);
};

export default SingleCount;
