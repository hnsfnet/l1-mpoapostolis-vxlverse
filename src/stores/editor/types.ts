import { StateCreator } from "zustand";
import * as THREE from "three";
import { Scene, GameObject } from "../../types";

/**
 * A single reversible operation. Each action knows how to undo *and* redo
 * itself, so the history stack never has to branch on an action "type".
 * `label` is kept purely for debugging/inspection.
 */
export type HistoryAction = {
  label?: string;
  undo: () => void;
  redo: () => void;
};

/** Undo/redo history. */
export interface HistorySlice {
  history: HistoryAction[];
  historyIndex: number;
  isUndoRedoOperation: boolean;

  addToHistory: (action: HistoryAction) => void;
  undo: () => void;
  redo: () => void;
}

/** Scenes, the objects inside them, and the current selection. */
export interface SceneSlice {
  scenes: Scene[];
  currentSceneId: string | null;
  selectedObjectId: string | null;
  showModelSelector: boolean;
  editingSceneName: string | null;
  isTransforming: boolean;
  focusOnObject: boolean;

  addScene: (scene: Scene) => void;
  removeScene: (id: string) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  setCurrentScene: (id: string) => void;
  createNewScene: (name: string, objects?: GameObject[]) => void;

  addObject: (sceneId: string, object: GameObject) => void;
  updateObject: (sceneId: string, objectId: string, updates: Partial<GameObject>) => void;
  removeObject: (sceneId: string, objectId: string) => void;
  duplicateObject: (sceneId: string, objectId: string) => void;

  setSelectedObject: (id: string | null) => void;
  setShowModelSelector: (show: boolean) => void;
  setEditingSceneName: (id: string | null) => void;
  updateSceneName: (id: string, name: string) => void;
  setIsTransforming: (isTransforming: boolean) => void;
  setFocusOnObject: (focus: boolean) => void;
}

/** Grid display and snapping settings. */
export interface GridSlice {
  gridSnap: boolean;
  showGrid: boolean;
  gridSize: number;
  snapPrecision: number;

  toggleGridSnap: () => void;
  setGridSnap: (enabled: boolean) => void;
  toggleGrid: () => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapPrecision: (precision: number) => void;
}

/** Brush ("stamp") placement tooling. */
export interface BrushSlice {
  brushActive: boolean;
  brushTemplate: GameObject | null;
  brushSize: number;

  setBrushActive: (active: boolean) => void;
  toggleBrushMode: (active: boolean) => void;
  setBrushTemplate: (object: GameObject | null) => void;
  setBrushSize: (size: number) => void;
  placeObjectWithBrush: (
    sceneId: string,
    position: THREE.Vector3 | { x: number; y: number; z: number }
  ) => void;
}

/** The full editor store, composed from the slices above. */
export type EditorState = SceneSlice & GridSlice & BrushSlice & HistorySlice;

/**
 * Helper alias for a slice creator. Every slice receives the *full* store via
 * `get()` so slices can collaborate (e.g. the grid slice records history, the
 * brush slice adds objects) without importing each other.
 */
export type EditorSliceCreator<TSlice> = StateCreator<EditorState, [], [], TSlice>;
