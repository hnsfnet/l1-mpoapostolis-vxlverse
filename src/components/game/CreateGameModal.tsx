import { useState } from "react";
import { CreateContentModal } from "../shared/CreateContentModal";

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GAME_TAGS = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Puzzle",
  "Shooter",
  "Racing",
  "Sports",
  "Simulation",
  "Horror",
];

export function CreateGameModal({ isOpen, onClose, onSuccess }: CreateGameModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <CreateContentModal
      isOpen={isOpen}
      onClose={() => {
        setSelectedTags([]);
        onClose();
      }}
      onSuccess={onSuccess}
      modalTitle="Create New Game"
      submitLabel="Create Game"
      titlePlaceholder="Enter game title"
      descriptionPlaceholder="Enter game description"
      showVisibility
      defaultIsPublic={true}
      buildExtraFields={() => ({ gameConf: JSON.stringify({}) })}
      errorMessage="Failed to create game. Please try again."
      onCreated={(record, navigate) => navigate(`/editor/${record.id}`)}
    >
      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Tags</label>
        <div className="flex flex-wrap gap-2">
          {GAME_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedTags.includes(tag)
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                  : "bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </CreateContentModal>
  );
}
