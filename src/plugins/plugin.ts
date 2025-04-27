export interface InertiaPlugin {
  id: string;

  name: string;

  description: string;

  do: (config: any) => Promise<void>;
}
