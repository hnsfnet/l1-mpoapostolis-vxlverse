import { EditorSliceCreator, GridSlice } from "./types";

/**
 * Grid display and snapping.
 *
 * Note: `setGridSize`/`setSnapPrecision` persist onto the *current scene* (via
 * the scene slice) rather than the top-level fields — the top-level values are
 * just the editor-wide defaults. This matches the pre-refactor behaviour.
 */
export const createGridSlice: EditorSliceCreator<GridSlice> = (set, get) => ({
  gridSnap: true,
  showGrid: true,
  gridSize: 1,
  snapPrecision: 0.1,

  toggleGridSnap: () => set({ gridSnap: !get().gridSnap }),
  setGridSnap: (enabled) => set({ gridSnap: enabled }),
  toggleGrid: () => set({ showGrid: !get().showGrid }),
  setShowGrid: (show) => set({ showGrid: show }),
  setGridSize: (size) => {
    const { currentSceneId } = get();
    if (currentSceneId) get().updateScene(currentSceneId, { gridSize: size });
  },
  setSnapPrecision: (precision) => {
    const { currentSceneId } = get();
    if (currentSceneId) get().updateScene(currentSceneId, { snapPrecision: precision });
  },
});
