import { pb } from "../../lib/pocketbase";
import { EditorState } from "./types";

/** Limits how often `func` runs; only the trailing call within `wait` fires. */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const debouncedUpdate = debounce(async (state: EditorState, gameId: string) => {
  try {
    if (!gameId) return;
    console.log("Saving editor state...", gameId);
    await pb.collection("games").update(gameId, {
      gameConf: {
        scenes: state.scenes,
        currentSceneId: state.currentSceneId,
        gridSnap: state.gridSnap,
      },
    });
  } catch (error) {
    console.error("Failed to save editor state:", error);
  }
}, 2_500);

/** Persists relevant editor state to PocketBase for the game in the URL. */
export const persistEditorState = (state: EditorState) => {
  const gameId = window.location.pathname.split("/").pop();
  if (gameId) debouncedUpdate(state, gameId);
};
