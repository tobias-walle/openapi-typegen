export type ArrayType<A> = A extends Array < infer T > ? T : A;
