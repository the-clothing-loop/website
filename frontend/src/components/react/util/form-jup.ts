type V<O> = Record<keyof O, FormDataEntryValue>;
type S<O> = Record<keyof O, string>;

export default function FormJup<O>(e: any): S<O> {
  let data = new FormData(e.target);
  console.log(data);

  let values: Partial<V<O>> = {};
  Array.from(data.entries()).forEach(([k, v]) => {
    //@ts-ignore
    values[k] = v.toString();
  });

  return values as S<O>;
}
