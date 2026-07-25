import type { FeatureFlagEnvironment } from "../model/types";

export const sortFlagEnvProductionFirst = (environments: FeatureFlagEnvironment[]) => {
  return environments.sort((a, b) => {
    if (a.environment.name === 'production') return -1;
    if (b.environment.name === 'production') return 1;
    return 0;
  });
}