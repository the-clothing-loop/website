type V<O> = Record<keyof O, FormDataEntryValue>;

export default function FormJup<O extends Record<string, any>>(e: any): V<O> {
  let data = new FormData(e.target);
  console.log(data);

  let values: Partial<V<O>> = {};
  Array.from(data.entries()).forEach(([k, v]) => {
    //@ts-ignore
    values[k] = v;
  });

  return values as V<O>;
}
