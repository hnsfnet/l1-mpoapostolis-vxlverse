import { useState } from "react";
import { Modal } from "../UI/Modal";
import { Input } from "../UI/input";
import { useNavigate } from "react-router-dom";
import { useCreateContent } from "../../hooks/useCreateContent";
import { ThumbnailUpload } from "../shared/ThumbnailUpload";
import { FormActions } from "../shared/FormActions";
import { ErrorMessage } from "../shared/ErrorMessage";

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
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    state,
    isLoading,
    error,
    setTitle,
    setDescription,
    setIsPublic,
    handleThumbnailSelect,
    clearThumbnail,
    submit,
    reset,
  } = useCreateContent({
    collection: "games",
    onSuccess: (record) => {
      setSelectedTags([]);
      navigate(`/editor/${record.id}`);
    },
    onClose,
  });

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(
      { gameConf: JSON.stringify({}) },
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Game">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail */}
        <ThumbnailUpload
          preview={state.thumbnailPreview}
          onFileSelect={handleThumbnailSelect}
          onClear={clearThumbnail}
        />

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <Input
            type="text"
            value={state.title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            placeholder="Enter game title"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={state.description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
            placeholder="Enter game description"
            rows={4}
            required
          />
        </div>

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

        {/* Visibility */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Visibility</label>
          <div className="flex items-center gap-2">
            <Input
              type="checkbox"
              checked={state.isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-blue-500 focus:ring-blue-500/50"
            />
            <span className="text-sm text-gray-400">Make this game public</span>
          </div>
        </div>

        <ErrorMessage message={error} />

        <FormActions
          onCancel={handleClose}
          isLoading={isLoading}
          submitLabel="Create Game"
        />
      </form>
    </Modal>
  );
}
