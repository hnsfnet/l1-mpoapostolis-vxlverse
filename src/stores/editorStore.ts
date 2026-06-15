/**
 * The editor store now lives in ./editor, split into focused slices
 * (scene/object, grid, brush, history) plus persistence.
 *
 * This file is kept as a compatibility barrel so existing
 * `../stores/editorStore` imports continue to resolve. New code can import
 * directly from `../stores/editor`.
 */
export * from "./editor";
