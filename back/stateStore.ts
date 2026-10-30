import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { INITIAL_MENU_ITEMS } from '../db/menuData';
import { DEFAULT_STORE_SETTINGS } from '../db/storeSettings';
import { WEEKLY_MENU_DISHES } from '../db/weeklyMenu';
import {
  DorearSharedState,
  validateSharedStatePayload,
} from '../db/stateValidation';

const STATE_FILE_PATH = '.dorear-live-state.json';
const STATE_TEMP_PATH = '.dorear-live-state.json.tmp';

let currentSharedState: DorearSharedState | null = null;
let initialized = false;
let writeQueue: Promise<void> = Promise.resolve();

export function buildServerDefaultState(): DorearSharedState {
  return {
    version: 10,
    updatedAt: Date.now(),
    items: INITIAL_MENU_ITEMS,
    weeklyDishes: WEEKLY_MENU_DISHES,
    weeklyOverrideDay: null,
    storeSettings: DEFAULT_STORE_SETTINGS,
  };
}

export async function getSharedState(): Promise<DorearSharedState | null> {
  if (!initialized) {
    initialized = true;
    try {
      if (fs.existsSync(STATE_FILE_PATH)) {
        const raw = await fsPromises.readFile(STATE_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        const validated = validateSharedStatePayload(parsed);
        if (validated) {
          currentSharedState = validated;
        }
      }
    } catch {
      // Ignore disk errors in read-only or ephemeral environments
    }
  }
  return currentSharedState;
}

export async function updateSharedState(
  data: DorearSharedState | null
): Promise<DorearSharedState | null> {
  await getSharedState();

  const nextState: DorearSharedState | null = data
    ? {
        ...data,
        version: 10,
        updatedAt: Date.now(),
      }
    : null;

  currentSharedState = nextState;
  initialized = true;

  writeQueue = writeQueue
    .then(async () => {
      try {
        if (nextState === null) {
          if (fs.existsSync(STATE_FILE_PATH)) {
            await fsPromises.unlink(STATE_FILE_PATH);
          }
        } else {
          const serialized = JSON.stringify(nextState, null, 2);
          await fsPromises.writeFile(STATE_TEMP_PATH, serialized, 'utf-8');
          await fsPromises.rename(STATE_TEMP_PATH, STATE_FILE_PATH);
        }
      } catch {
        // Ignore disk errors in read-only / serverless environments
      }
    })
    .catch(() => {
      // Keep queue alive
    });

  await writeQueue;
  return currentSharedState;
}

export async function applyBaristaStateUpdate(
  incomingItems: DorearSharedState['items']
): Promise<DorearSharedState> {
  const baseState = (await getSharedState()) || buildServerDefaultState();
  const availabilityById = new Map<string, boolean>();
  for (const item of incomingItems) {
    availabilityById.set(item.id, Boolean(item.available));
  }

  const updatedItems = baseState.items.map((item) =>
    availabilityById.has(item.id)
      ? { ...item, available: availabilityById.get(item.id)! }
      : item
  );

  const saved = await updateSharedState({
    ...baseState,
    items: updatedItems,
  });

  return saved || { ...baseState, items: updatedItems, updatedAt: Date.now() };
}
