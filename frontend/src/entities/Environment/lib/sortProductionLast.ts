import type { Environment } from "../model/types";

export const sortProductionLast = (environments: Environment[]) => {
  return environments.sort((a, b) => {
    if (a.name === 'production') return -1;
    if (b.name === 'production') return 1;
    return 0;
  });
}