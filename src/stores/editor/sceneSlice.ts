import * as THREE from "three";
import { Scene, GameObject } from "../../types";
import { EditorSliceCreator, SceneSlice } from "./types";

const createDefaultScene = (name: string, id: string, objects: GameObject[] = []): Scene => ({
  id,
  name,
  showGrid: true,
  gridSize: 1,
  snapPrecision: 0.1,
  objects,
  environment: "sunset",
  background: "environment",
  ambientLight: 0.5,
  fog: {
    color: "#000000",
    near: 1,
    far: 100,
  },
  clouds: {
    enabled: false,
    speed: 1,
    opacity: 0.5,
    count: 20,
  },
  stars: {
    enabled: false,
    count: 5000,
    depth: 50,
    fade: true,
  },
});

/**
 * Scenes, their objects and the current selection.
 *
 * Mutating actions record a history entry through `addToHistory` (provided by
 * the history slice). `addToHistory` ignores calls made during undo/redo, so a
 * replayed `redo()` here never pushes a duplicate entry.
 */
export const createSceneSlice: EditorSliceCreator<SceneSlice> = (set, get) => ({
  scenes: [],
  currentSceneId: null,
  selectedObjectId: null,
  showModelSelector: false,
  editingSceneName: null,
  isTransforming: false,
  focusOnObject: false,

  addScene: (scene) => {
    const prevScenes = [...get().scenes];

    set((state) => {
      const exists = state.scenes.some((s) => s.id === scene.id);
      if (exists) return state;
      return {
        brushActive: false,
        brushTemplate: null,
        scenes: [...state.scenes, scene],
        currentSceneId: scene.id,
      };
    });

    get().addToHistory({
      label: "ADD_SCENE",
      undo: () =>
        set({
          scenes: prevScenes,
          currentSceneId: prevScenes.length > 0 ? prevScenes[prevScenes.length - 1].id : null,
        }),
      redo: () => get().addScene(scene),
    });
  },

  removeScene: (id) => {
    const prevScenes = [...get().scenes];
    const sceneToRemove = prevScenes.find((s) => s.id === id);
    const prevCurrentSceneId = get().currentSceneId;
    const prevSelectedObjectId = get().selectedObjectId;

    set((state) => ({
      brushActive: false,
      brushTemplate: null,
      scenes: state.scenes.filter((s) => s.id !== id),
      currentSceneId: null,
      selectedObjectId: null,
    }));

    if (sceneToRemove) {
      get().addToHistory({
        label: "REMOVE_SCENE",
        undo: () =>
          set({
            scenes: prevScenes,
            currentSceneId: prevCurrentSceneId,
            selectedObjectId: prevSelectedObjectId,
          }),
        redo: () => get().removeScene(id),
      });
    }
  },

  updateScene: (id, updates) => {
    const prevScenes = [...get().scenes];
    const sceneToUpdate = prevScenes.find((s) => s.id === id);

    set((state) => ({
      scenes: state.scenes.map((scene) => (scene.id === id ? { ...scene, ...updates } : scene)),
    }));

    if (sceneToUpdate) {
      get().addToHistory({
        label: "UPDATE_SCENE",
        undo: () => set({ scenes: prevScenes }),
        redo: () => get().updateScene(id, updates),
      });
    }
  },

  setCurrentScene: (id) => {
    const prevSceneId = get().currentSceneId;

    set({ currentSceneId: id });

    get().addToHistory({
      label: "CHANGE_SCENE",
      undo: () => set({ currentSceneId: prevSceneId }),
      redo: () => get().setCurrentScene(id),
    });
  },

  createNewScene: (name, objects) => {
    const id = crypto.randomUUID();
    const newScene = createDefaultScene(name, id, objects);
    set((state) => ({
      brushActive: false,
      brushTemplate: null,
      scenes: [...state.scenes, newScene],
      currentSceneId: id,
    }));
  },

  addObject: (sceneId, object) => {
    const prevScenes = [...get().scenes];
    const prevSelectedObjectId = get().selectedObjectId;

    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, objects: [...scene.objects, object] } : scene
      ),
      selectedObjectId: object.id,
    }));

    get().addToHistory({
      label: "ADD_OBJECT",
      undo: () => set({ scenes: prevScenes, selectedObjectId: prevSelectedObjectId }),
      redo: () => get().addObject(sceneId, object),
    });
  },

  updateObject: (sceneId, objectId, updates) => {
    const prevScenes = [...get().scenes];

    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              objects: scene.objects.map((obj) =>
                obj.id === objectId ? { ...obj, ...updates } : obj
              ),
            }
          : scene
      ),
    }));

    get().addToHistory({
      label: "UPDATE_OBJECT",
      undo: () => set({ scenes: prevScenes }),
      redo: () => get().updateObject(sceneId, objectId, updates),
    });
  },

  removeObject: (sceneId, objectId) => {
    const prevScenes = [...get().scenes];
    const prevSelectedObjectId = get().selectedObjectId;
    const objectToRemove = prevScenes
      .find((s) => s.id === sceneId)
      ?.objects.find((o) => o.id === objectId);

    set((state) => ({
      brushActive: false,
      brushTemplate: null,
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, objects: scene.objects.filter((obj) => obj.id !== objectId) }
          : scene
      ),
      selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId,
    }));

    if (objectToRemove) {
      get().addToHistory({
        label: "REMOVE_OBJECT",
        undo: () => set({ scenes: prevScenes, selectedObjectId: prevSelectedObjectId }),
        redo: () => get().removeObject(sceneId, objectId),
      });
    }
  },

  duplicateObject: (sceneId, objectId) => {
    const prevScenes = [...get().scenes];
    const prevSelectedObjectId = get().selectedObjectId;

    set((state) => {
      const scene = state.scenes.find((s) => s.id === sceneId);
      const object = scene?.objects.find((obj) => obj.id === objectId);
      if (!scene || !object) return state;

      // Deep clone, give it a fresh id and nudge it so it doesn't overlap.
      const newObject: GameObject = JSON.parse(JSON.stringify(object));
      newObject.id = new THREE.Object3D().uuid;
      if (newObject.position) {
        newObject.position.x += 0.5;
        newObject.position.z += 0.5;
      }

      return {
        brushActive: false,
        brushTemplate: null,
        scenes: state.scenes.map((s) =>
          s.id === sceneId ? { ...s, objects: [...s.objects, newObject] } : s
        ),
        selectedObjectId: newObject.id,
      };
    });

    get().addToHistory({
      label: "DUPLICATE_OBJECT",
      undo: () => set({ scenes: prevScenes, selectedObjectId: prevSelectedObjectId }),
      redo: () => get().duplicateObject(sceneId, objectId),
    });
  },

  setSelectedObject: (id) => set({ selectedObjectId: id }),
  setShowModelSelector: (show) => set({ showModelSelector: show }),
  setEditingSceneName: (id) => set({ editingSceneName: id }),
  updateSceneName: (id, name) =>
    set((state) => ({
      scenes: state.scenes.map((scene) => (scene.id === id ? { ...scene, name } : scene)),
      editingSceneName: null,
    })),
  setIsTransforming: (isTransforming) => set({ isTransforming }),
  setFocusOnObject: (focus) => set({ focusOnObject: focus }),
});
