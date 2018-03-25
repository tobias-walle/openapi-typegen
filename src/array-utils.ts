export function getUniqueFilter<T>(serialize: (value: T) => string) {
  return (value: T, index: number, self: any[]) => {
    return self.indexOf(value) === index;
  };
}
