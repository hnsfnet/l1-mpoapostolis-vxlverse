import { ReactNode } from "react";
import { Image, Loader2, X } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { RecordModel } from "pocketbase";
import { Modal } from "../UI/Modal";
import { Input } from "../UI/input";
import { ContentCreatorConfig, useContentCreator } from "../../hooks/useContentCreator";

// Shared field styling so game/gallery (and future creation flows) stay in sync.
const FIELD_CLASS =
  "w-full px-4 py-3 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300";

export interface CreateContentModalProps extends ContentCreatorConfig {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful creation; the parent typically closes + revalidates. */
  onSuccess: () => void;

  modalTitle: string;
  submitLabel: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  /** When set, enforces a max length on the description and shows a character counter. */
  descriptionMaxLength?: number;
  /** Whether to render the public/private visibility toggle. */
  showVisibility?: boolean;

  /** Side effect run with the created record, e.g. navigating into an editor. */
  onCreated?: (record: RecordModel, navigate: NavigateFunction) => void;

  /** Type-specific fields rendered between the description and the actions. */
  children?: ReactNode;
}

/**
 * Reusable creation modal shared by every "create content" flow. It owns the
 * common UI (thumbnail uploader, title, description, actions) and delegates the
 * form-state machine to {@link useContentCreator}. Type-specific concerns are
 * supplied through props (extra fields, validation, post-create side effects)
 * and an optional `children` slot, so adding a new entry never means copying
 * this component.
 */
export function CreateContentModal({
  isOpen,
  onClose,
  onSuccess,
  modalTitle,
  submitLabel,
  titlePlaceholder,
  descriptionPlaceholder,
  descriptionMaxLength,
  showVisibility,
  onCreated,
  children,
  ...creatorConfig
}: CreateContentModalProps) {
  const navigate = useNavigate();
  const {
    title,
    setTitle,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    thumbnailPreview,
    selectThumbnail,
    clearThumbnail,
    isSubmitting,
    error,
    reset,
    submit,
  } = useContentCreator(creatorConfig);

  // Reset shared state on every close so a reopened modal never shows residue.
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const record = await submit();
    if (!record) return;
    onSuccess();
    onCreated?.(record, navigate);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-dashed border-white/10 hover:border-blue-400/50 transition-all duration-300 group">
            {thumbnailPreview ? (
              <div className="relative h-full">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="absolute top-4 right-4 p-2.5 bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/30 hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group-hover:bg-white/5 transition-all duration-300">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-violet-500/10 group-hover:scale-110 transition-all duration-300">
                  <Image className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <span className="text-sm text-gray-500 group-hover:text-blue-400 mt-4 transition-colors duration-300">
                  Click to upload thumbnail
                </span>
                <span className="text-xs text-gray-600 mt-1">Recommended: 1920x1080px</span>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => selectThumbnail(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={FIELD_CLASS}
            placeholder={titlePlaceholder}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${FIELD_CLASS} resize-none`}
            placeholder={descriptionPlaceholder}
            rows={4}
            required
            maxLength={descriptionMaxLength}
          />
          {descriptionMaxLength != null && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/{descriptionMaxLength} characters
            </div>
          )}
        </div>

        {/* Type-specific fields (e.g. tags) */}
        {children}

        {/* Visibility */}
        {showVisibility && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Visibility</label>
            <div className="flex items-center gap-2">
              <Input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-blue-500 focus:ring-blue-500/50"
              />
              <span className="text-sm text-gray-400">Make this public</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-blue-500 disabled:hover:to-violet-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
