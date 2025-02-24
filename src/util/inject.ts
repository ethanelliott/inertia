export type Constructable = { new (...args: any[]): any };

const ref = new Map<Constructable, InstanceType<Constructable>>();

export function inject<T extends Constructable>(
  injectable: T,
): InstanceType<T> {
  if (!ref.has(injectable)) {
    ref.set(injectable, new injectable());
  }
  return ref.get(injectable) as InstanceType<T>;
}
