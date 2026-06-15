import { Object3D } from "three";
import { Modal } from "../UI/Modal";
import { Input } from "../UI/input";
import { useCreateContent } from "../../hooks/useCreateContent";
import { ThumbnailUpload } from "../shared/ThumbnailUpload";
import { FormActions } from "../shared/FormActions";
import { ErrorMessage } from "../shared/ErrorMessage";

interface CreateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGalleryModal({ isOpen, onClose, onSuccess }: CreateGalleryModalProps) {
  const {
    state,
    isLoading,
    error,
    setTitle,
    setDescription,
    handleThumbnailSelect,
    clearThumbnail,
    submit,
    reset,
  } = useCreateContent({
    collection: "games",
    onSuccess,
    onClose,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build the gallery-specific default scene config
    const currentSceneId = new Object3D().uuid;
    const scenes = [{ id: currentSceneId, objects: [] }];
    const gameConf = JSON.stringify({ scenes, currentSceneId, gridSnap: false });

    await submit(
      {
        type: "gallery",
        creator: "",       // will be overridden by owner in service
        paintingCount: "0",
        gameConf,
      },
      { requireThumbnail: true },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Gallery">
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
            placeholder="Enter gallery title"
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
            placeholder="Enter gallery description"
            rows={4}
            required
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {state.description.length}/500 characters
          </div>
        </div>

        <ErrorMessage message={error} />

        <FormActions
          onCancel={handleClose}
          isLoading={isLoading}
          submitLabel="Create Gallery"
        />
      </form>
    </Modal>
  );
}
