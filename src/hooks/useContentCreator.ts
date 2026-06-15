import { useCallback, useState } from "react";
import type { RecordModel } from "pocketbase";
import { useAuthStore } from "../stores/authStore";
import { createContent } from "../lib/contentService";

export interface ContentCreatorValues {
  title: string;
  description: string;
  thumbnail: File | null;
}

export interface ContentCreatorConfig {
  /** Default visibility applied on mount and after a reset. */
  defaultIsPublic?: boolean;
  /** Build type-specific scalar fields from the current owner id. */
  buildExtraFields?: (ownerId: string) => Record<string, string>;
  /** Validate the non-file fields; return an error message or `null` when valid. */
  validate?: (values: ContentCreatorValues) => string | null;
  /** Validate a picked thumbnail file; return an error message or `null` when valid. */
  validateThumbnail?: (file: File) => string | null;
  /** Message surfaced when the PocketBase request itself fails. */
  errorMessage?: string;
}

/**
 * Encapsulates the form-state machine shared by every "create content" flow:
 * thumbnail selection/preview, submit loading, error handling and reset.
 *
 * The view layer only wires inputs to the returned state; the PocketBase
 * details live in {@link createContent}.
 */
export function useContentCreator(config: ContentCreatorConfig) {
  const { defaultIsPublic = true } = config;
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setIsPublic(defaultIsPublic);
    setThumbnail(null);
    setThumbnailPreview(null);
    setIsSubmitting(false);
    setError(null);
  }, [defaultIsPublic]);

  const selectThumbnail = useCallback(
    (file: File | null) => {
      if (!file) {
        setThumbnail(null);
        setThumbnailPreview(null);
        return;
      }

      const thumbnailError = config.validateThumbnail?.(file);
      if (thumbnailError) {
        setError(thumbnailError);
        return;
      }

      setError(null);
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [config]
  );

  const clearThumbnail = useCallback(() => {
    setThumbnail(null);
    setThumbnailPreview(null);
  }, []);

  /**
   * Validates, submits and resets on success. Returns the created record, or
   * `null` when the submission was blocked (no user / validation) or failed.
   * State is always settled in `finally`, so the UI never stays stuck loading.
   */
  const submit = useCallback(async (): Promise<RecordModel | null> => {
    if (!user) return null;

    const validationError = config.validate?.({ title, description, thumbnail });
    if (validationError) {
      setError(validationError);
      return null;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const record = await createContent({
        title,
        description,
        ownerId: user.id,
        isPublic,
        thumbnail,
        extraFields: config.buildExtraFields?.(user.id),
      });
      reset();
      return record;
    } catch (err) {
      console.error("Failed to create content:", err);
      setError(config.errorMessage ?? "Failed to create. Please try again.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, title, description, isPublic, thumbnail, config, reset]);

  return {
    user,
    title,
    setTitle,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    thumbnail,
    thumbnailPreview,
    selectThumbnail,
    clearThumbnail,
    isSubmitting,
    error,
    setError,
    reset,
    submit,
  };
}
