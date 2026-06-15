import * as THREE from "three";
import { GameObject } from "../../types";
import { EditorSliceCreator, BrushSlice } from "./types";

/**
 * Brush ("stamp") placement tooling. Placement reuses the scene slice's
 * `addObject`, so every brushed object participates in undo/redo for free.
 */
export const createBrushSlice: EditorSliceCreator<BrushSlice> = (set, get) => ({
  brushActive: false,
  brushTemplate: null,
  brushSize: 1,

  setBrushActive: (active) => set({ brushActive: active }),

  toggleBrushMode: (active) => {
    const selectedId = get().selectedObjectId;
    const currentObject = get()
      .scenes.find((s) => s.id === selectedId)
      ?.objects.find((o) => o.id === selectedId);
    set({
      brushActive: active,
      brushTemplate: active ? (currentObject ?? null) : null,
    });
  },

  setBrushTemplate: (object) => set({ brushTemplate: object }),
  setBrushSize: (size) => set({ brushSize: Math.max(1, size) }),

  placeObjectWithBrush: (sceneId, position) => {
    const object = get()
      .scenes.find((s) => s.id === sceneId)
      ?.objects.find((o) => o.id === get().selectedObjectId);
    if (!object) return;

    const newObject = {
      id: new THREE.Object3D().uuid,
      name: object.name,
      modelUrl: object.modelUrl,
      position: {
        x: position.x !== undefined ? position.x : 0,
        y: position.y !== undefined ? position.y : 0,
        z: position.z !== undefined ? position.z : 0,
      },
      rotation: object?.rotation ?? { x: 0, y: 0, z: 0 },
      scale: object?.scale ?? { x: 1, y: 1, z: 1 },
    } as GameObject;

    get().addObject(sceneId, newObject);

    // Force a state update to trigger a re-render.
    set((state) => ({ ...state }));
  },
});
