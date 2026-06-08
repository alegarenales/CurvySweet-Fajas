import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const statePath = join(process.cwd(), ".curvysweet", "admin-state.json");
const defaultState = {
  maintenance: false
};
function readAdminState() {
  if (!existsSync(statePath)) {
    return defaultState;
  }
  try {
    return {
      ...defaultState,
      ...JSON.parse(readFileSync(statePath, "utf-8"))
    };
  } catch {
    return defaultState;
  }
}
function writeAdminState(nextState) {
  const state = {
    ...readAdminState(),
    ...nextState
  };
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  return state;
}

export { readAdminState as r, writeAdminState as w };
