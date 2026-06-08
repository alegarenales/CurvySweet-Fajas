import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const statePath = join(process.cwd(), ".curvysweet", "admin-state.json");

type AdminState = {
  maintenance: boolean;
};

const defaultState: AdminState = {
  maintenance: false,
};

export function readAdminState(): AdminState {
  if (!existsSync(statePath)) {
    return defaultState;
  }

  try {
    return {
      ...defaultState,
      ...JSON.parse(readFileSync(statePath, "utf-8")),
    };
  } catch {
    return defaultState;
  }
}

export function writeAdminState(nextState: Partial<AdminState>) {
  const state = {
    ...readAdminState(),
    ...nextState,
  };

  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2));

  return state;
}
