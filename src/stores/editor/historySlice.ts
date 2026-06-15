import { EditorSliceCreator, HistorySlice } from "./types";

/**
 * Undo/redo history.
 *
 * Every mutating action pushes a {@link HistoryAction} that carries its own
 * `undo` and `redo` closures (the command pattern). Replaying is therefore a
 * plain `action.redo()` call — there is no central `switch`/`if-else` that has
 * to stay in sync with the list of action types.
 *
 * While `isUndoRedoOperation` is set, the mutating actions skip recording new
 * history, so undo/redo never pollute the stack.
 */
export const createHistorySlice: EditorSliceCreator<HistorySlice> = (set, get) => ({
  history: [],
  historyIndex: -1,
  isUndoRedoOperation: false,

  addToHistory: (action) => {
    if (get().isUndoRedoOperation) return;

    const { history, historyIndex } = get();
    set({
      history: [...history.slice(0, historyIndex + 1), action],
      historyIndex: historyIndex + 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;

    set({ isUndoRedoOperation: true });
    history[historyIndex].undo();
    set({
      historyIndex: Math.max(0, historyIndex - 1),
      isUndoRedoOperation: false,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    set({ isUndoRedoOperation: true });
    history[historyIndex + 1].redo();
    set({
      historyIndex: historyIndex + 1,
      isUndoRedoOperation: false,
    });
  },
});
