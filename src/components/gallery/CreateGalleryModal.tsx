import { Object3D } from "three";
import { CreateContentModal } from "../shared/CreateContentModal";

interface CreateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** Galleries start with a single empty scene; that initial config lives in gameConf. */
function buildInitialGalleryConf(): string {
  const currentSceneId = new Object3D().uuid;
  const scenes = [{ id: currentSceneId, objects: [] }];
  return JSON.stringify({ scenes, currentSceneId, gridSnap: false });
}

export function CreateGalleryModal({ isOpen, onClose, onSuccess }: CreateGalleryModalProps) {
  return (
    <CreateContentModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      modalTitle="Create New Gallery"
      submitLabel="Create Gallery"
      titlePlaceholder="Enter gallery title"
      descriptionPlaceholder="Enter gallery description"
      descriptionMaxLength={500}
      defaultIsPublic={false}
      buildExtraFields={(ownerId) => ({
        creator: ownerId,
        paintingCount: "0",
        type: "gallery",
        gameConf: buildInitialGalleryConf(),
      })}
      validate={({ title, description, thumbnail }) => {
        if (!title.trim()) return "Please enter a gallery title";
        if (title.length < 3) return "Gallery title must be at least 3 characters long";
        if (!description.trim()) return "Please enter a gallery description";
        if (!thumbnail) return "Please upload a thumbnail image";
        return null;
      }}
      validateThumbnail={(file) => {
        if (!file.type.startsWith("image/")) return "Please upload an image file for the thumbnail";
        if (file.size > 5 * 1024 * 1024) return "Image size must be less than 5MB";
        return null;
      }}
      errorMessage="Failed to create gallery. Please try again."
    />
  );
}
