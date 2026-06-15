import { create } from "zustand";
import { EditorState } from "./types";
import { createSceneSlice } from "./sceneSlice";
import { createGridSlice } from "./gridSlice";
import { createBrushSlice } from "./brushSlice";
import { createHistorySlice } from "./historySlice";
import { persistEditorState } from "./persistence";

/**
 * The editor store, composed from focused slices:
 *  - {@link createSceneSlice}   scenes, objects and selection
 *  - {@link createGridSlice}    grid display + snapping
 *  - {@link createBrushSlice}   brush/stamp placement
 *  - {@link createHistorySlice} undo/redo
 *
 * The public surface (a single flat `useEditorStore`) is unchanged, so
 * `getState`/`setState`/`subscribe` and every existing selector keep working.
 */
export const useEditorStore = create<EditorState>()((...args) => ({
  ...createSceneSlice(...args),
  ...createGridSlice(...args),
  ...createBrushSlice(...args),
  ...createHistorySlice(...args),
}));

// Auto-save editor state to PocketBase whenever it changes.
useEditorStore.subscribe(persistEditorState);

/** The scene matching `currentSceneId`, or `undefined`. */
export const useCurrentScene = () =>
  useEditorStore((state) => state.scenes.find((scene) => scene.id === state.currentSceneId));

/** The selected object within the current scene, or `undefined`. */
export const useSelectedObject = () =>
  useEditorStore((state) => {
    const scene = state.scenes.find((s) => s.id === state.currentSceneId);
    return scene?.objects.find((object) => object.id === state.selectedObjectId);
  });

export type {
  EditorState,
  HistoryAction,
  SceneSlice,
  GridSlice,
  BrushSlice,
  HistorySlice,
} from "./types";
export { debounce } from "./persistence";
