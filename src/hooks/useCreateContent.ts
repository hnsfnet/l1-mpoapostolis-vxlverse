import { useState, useCallback, useRef } from "react";
import { createContent, BaseContentFields, ExtraFields } from "../lib/createContent";
import { useAuthStore } from "../stores/authStore";

export interface UseCreateContentOptions {
  collection: string;
  onSuccess?: (record: { id: string }) => void;
  onClose?: () => void;
}

export interface CreateContentState {
  title: string;
  description: string;
  isPublic: boolean;
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
}

const INITIAL_STATE: CreateContentState = {
  title: "",
  description: "",
  isPublic: true,
  thumbnailFile: null,
  thumbnailPreview: null,
};

export function useCreateContent({ collection, onSuccess, onClose }: UseCreateContentOptions) {
  const { user } = useAuthStore();

  const [state, setState] = useState<CreateContentState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref so we can always read the latest state inside async callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Field setters ──────────────────────────────────────────────────────────

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title }));
    setError(null);
  }, []);

  const setDescription = useCallback((description: string) => {
    setState((prev) => ({ ...prev, description }));
    setError(null);
  }, []);

  const setIsPublic = useCallback((isPublic: boolean) => {
    setState((prev) => ({ ...prev, isPublic }));
  }, []);

  // ── Thumbnail ──────────────────────────────────────────────────────────────

  const handleThumbnailSelect = useCallback((file: File) => {
    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for the thumbnail");
      return;
    }
    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setState((prev) => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const clearThumbnail = useCallback(() => {
    setState((prev) => ({ ...prev, thumbnailFile: null, thumbnailPreview: null }));
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
    setIsLoading(false);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const submit = useCallback(
    async (extra: ExtraFields = {}, options?: { requireThumbnail?: boolean }) => {
      if (!user) {
        setError("You must be signed in to create content.");
        return null;
      }

      const { title, description, thumbnailFile } = stateRef.current;

      // Validation
      if (!title.trim()) {
        setError("Please enter a title.");
        return null;
      }
      if (title.trim().length < 3) {
        setError("Title must be at least 3 characters long.");
        return null;
      }
      if (!description.trim()) {
        setError("Please enter a description.");
        return null;
      }
      if (options?.requireThumbnail && !thumbnailFile) {
        setError("Please upload a thumbnail image.");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const base: BaseContentFields = {
          title: title.trim(),
          description: description.trim(),
          isPublic: stateRef.current.isPublic,
          thumbnail: thumbnailFile,
        };

        const record = await createContent(collection, user.id, base, extra);

        // Reset form state
        reset();

        // Notify caller
        onSuccess?.(record as { id: string });
        onClose?.();

        return record;
      } catch (err) {
        console.error(`Failed to create ${collection}:`, err);
        setError("Failed to create. Please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [collection, user, reset, onSuccess, onClose],
  );

  return {
    // state
    state,
    isLoading,
    error,

    // setters
    setTitle,
    setDescription,
    setIsPublic,

    // thumbnail
    handleThumbnailSelect,
    clearThumbnail,

    // actions
    submit,
    reset,
  };
}
