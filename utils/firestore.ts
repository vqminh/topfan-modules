import { FieldPath, getDocs, Query, where } from "firebase/firestore";

export interface TData<T> {
  id: string;
  data: T;
}

export function startWith(field: string | FieldPath, prefix: string) {
  if (prefix) {
    const length = prefix.length;
    const left = prefix.slice(0, length - 1);
    const right = String.fromCharCode(prefix.charCodeAt(length - 1) + 1);
    const end = left + right;
    return [where(field, ">=", prefix), where(field, "<", end)];
  }
  return [];
}

export async function toQueryResult<T>(
  ref: Query,
  sort?: string,
  pageSize: number = 10
) {
  const data = await getDocs(ref).then((snap) =>
    snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          data: doc.data(),
        } as TData<T>)
    )
  );
  const length = data.length;
  const next =
    length >= pageSize
      ? sort
        ? (data[length - 1]?.data as any)?.[sort]
        : data[length - 1]?.id
      : undefined;
  return {
    data,
    next,
  };
}
