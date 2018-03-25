export type ArrayType<A> = A extends Array < infer T > ? T : A;
export type Class<T> = new () => T;
