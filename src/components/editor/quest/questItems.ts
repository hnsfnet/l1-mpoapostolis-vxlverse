import { Item, Quest } from "../../../types";

/** Whether an item operation targets a quest's requirements or its rewards. */
export type QuestItemBucket = "requirements" | "rewards";

/**
 * Union of `current` and `incoming` keyed by `id`. Existing items that are also
 * present in `incoming` are dropped and re-added from `incoming`, so the
 * incoming version wins and ends up at the tail. Preserves the original
 * add-items behaviour used by the quest editor.
 */
export function mergeItemsById<T extends { id: string }>(current: T[] = [], incoming: T[]): T[] {
  const kept = current.filter((item) => !incoming.some((next) => next.id === item.id));
  return [...kept, ...incoming];
}

/** Returns `items` without the entry whose `id` matches. */
export function removeItemById<T extends { id: string }>(items: T[] = [], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Builds the `updateQuest` patch for adding `items` to a quest bucket
 * (requirements or rewards), de-duplicating by id.
 */
export function addItemsToQuest(
  quest: Quest,
  bucket: QuestItemBucket,
  items: Item[]
): Partial<Quest> {
  if (bucket === "requirements") {
    return {
      requirements: {
        ...quest.requirements,
        items: mergeItemsById(quest.requirements.items, items),
      },
    };
  }
  return {
    rewards: { ...quest.rewards, items: mergeItemsById(quest.rewards.items, items) },
  };
}

/** Builds the `updateQuest` patch for removing one item from a quest bucket. */
export function removeItemFromQuest(
  quest: Quest,
  bucket: QuestItemBucket,
  itemId: string
): Partial<Quest> {
  if (bucket === "requirements") {
    return {
      requirements: {
        ...quest.requirements,
        items: removeItemById(quest.requirements.items, itemId),
      },
    };
  }
  return {
    rewards: { ...quest.rewards, items: removeItemById(quest.rewards.items, itemId) },
  };
}
