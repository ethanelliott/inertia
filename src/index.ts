import { InertiaClient } from './inertia';

const ic = new InertiaClient();

ic.init().catch((err) => {
  console.error(err);
});
