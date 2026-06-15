import { useState } from "react";
import { Quest, Item } from "../../../types";
import { ItemSelector } from "../ItemSelector";
import { QuestStory } from "./QuestStory";
import { QuestRequirements } from "./QuestRequirements";
import { QuestRewards } from "./QuestRewards";
import { addItemsToQuest, removeItemFromQuest, QuestItemBucket } from "./questItems";

interface QuestDetailsProps {
  quest: Quest;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
}

/**
 * Editor for a single quest's fields (story, requirements, rewards). The list
 * of quests is managed by {@link QuestPanel}.
 */
export function QuestDetails({ quest, updateQuest }: QuestDetailsProps) {
  const [itemSelector, setItemSelector] = useState<{ bucket: QuestItemBucket; open: boolean }>({
    bucket: "requirements",
    open: false,
  });

  const openItemSelector = (bucket: QuestItemBucket) => setItemSelector({ bucket, open: true });
  const closeItemSelector = () => setItemSelector((prev) => ({ ...prev, open: false }));

  const handleAddItems = (items: Item[]) => {
    if (items.length > 0) {
      updateQuest(quest.id, addItemsToQuest(quest, itemSelector.bucket, items));
    }
    closeItemSelector();
  };

  const handleRemoveItem = (itemId: string, bucket: QuestItemBucket) => {
    updateQuest(quest.id, removeItemFromQuest(quest, bucket, itemId));
  };

  const selectorItems =
    itemSelector.bucket === "requirements"
      ? quest.requirements.items || []
      : quest.rewards.items || [];

  return (
    <>
      <div className="space-y-4">
        <QuestStory quest={quest} updateQuest={updateQuest} />

        <QuestRequirements
          quest={quest}
          updateQuest={updateQuest}
          onAddItem={() => openItemSelector("requirements")}
          onRemoveItem={(itemId) => handleRemoveItem(itemId, "requirements")}
        />

        <QuestRewards
          quest={quest}
          updateQuest={updateQuest}
          onAddItem={() => openItemSelector("rewards")}
          onRemoveItem={(itemId) => handleRemoveItem(itemId, "rewards")}
        />
      </div>

      {itemSelector.open && (
        <ItemSelector
          onSelect={handleAddItems}
          initialSelectedItems={selectorItems}
          onClose={closeItemSelector}
          title={`Select ${itemSelector.bucket === "requirements" ? "Required" : "Reward"} Items`}
          maxSelections={10}
        />
      )}
    </>
  );
}
