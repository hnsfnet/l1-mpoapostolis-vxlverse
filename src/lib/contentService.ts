import type { RecordModel } from "pocketbase";
import { pb } from "./pocketbase";

/**
 * Normalized payload for creating a piece of content (game, gallery, ...).
 *
 * All content types are stored in the same PocketBase `games` collection, so
 * the only thing that differs between them is the set of type-specific scalar
 * fields supplied via `extraFields` (already stringified by the caller).
 */
export interface CreateContentInput {
  title: string;
  description: string;
  ownerId: string;
  isPublic: boolean;
  thumbnail?: File | null;
  /** Type-specific scalar fields appended verbatim (e.g. gameConf, type). */
  extraFields?: Record<string, string>;
}

/**
 * Single place where the PocketBase submission for a creation flow is assembled.
 * Pages and modals should never build this FormData themselves.
 */
export async function createContent(input: CreateContentInput): Promise<RecordModel> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("owner", input.ownerId);
  formData.append("isPublic", String(input.isPublic));

  if (input.extraFields) {
    for (const [key, value] of Object.entries(input.extraFields)) {
      formData.append(key, value);
    }
  }

  if (input.thumbnail) {
    formData.append("thumbnail", input.thumbnail);
  }

  return pb.collection("games").create(formData);
}
