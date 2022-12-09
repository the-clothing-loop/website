import { Dispatch, SetStateAction, useState } from "react";

export type SetValue<V> = <K extends keyof V>(key: K, value: V[K]) => void;
export type SetValues<V> = Dispatch<SetStateAction<V>>;

export default function useForm<V extends {}>(
  initialValues: V
): [V, SetValue<V>, SetValues<V>] {
  const [values, setValues] = useState(initialValues);

  function setValue<K extends keyof V>(key: K, value: V[K]) {
    setValues(
      //@ts-ignore
      (state: V) => ({ ...state, [key]: value })
    );
  }

  return [values, setValue, setValues];
}
