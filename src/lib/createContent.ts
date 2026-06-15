import { pb } from "../lib/pocketbase";

/** Common fields shared by all creatable content types. */
export interface BaseContentFields {
  title: string;
  description: string;
  isPublic: boolean;
  thumbnail?: File | null;
}

/** Extra fields that a specific content type can append. */
export type ExtraFields = Record<string, string | boolean | number | File | Blob>;

/**
 * Build a FormData payload from base + extra fields and upload to PocketBase.
 * Returns the created record.
 */
export async function createContent(
  collection: string,
  ownerId: string,
  base: BaseContentFields,
  extra: ExtraFields = {},
): Promise<{ id: string; [key: string]: unknown }> {
  const fd = new FormData();

  // Common fields
  fd.append("title", base.title.trim());
  fd.append("description", base.description.trim());
  fd.append("owner", ownerId);
  fd.append("isPublic", String(base.isPublic));

  // Thumbnail
  if (base.thumbnail) {
    fd.append("thumbnail", base.thumbnail);
  }

  // Extra fields (stringified if object)
  for (const [key, value] of Object.entries(extra)) {
    if (typeof value === "object" && !(value instanceof File) && !(value instanceof Blob)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }

  return pb.collection(collection).create(fd);
}
