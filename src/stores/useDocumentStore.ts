import { create } from "zustand";
import type { CanvasEngine, Document } from "~/core";
import type { Point } from "~/types";
import type { Tool, ToolConfigs } from "~/types/tools";

interface DocumentStoreState {
  document: Document;
  engine: CanvasEngine | null;
  _version: number;
  _docListener: (() => void) | null;
}

interface DocumentStoreActions {
  initDocument: (doc: Document) => void;
  setEngine: (engine: CanvasEngine | null) => void;
  startStrokeGroup: () => void;
  startStroke: <T extends Tool>(
    tool: T,
    toolConfig: ToolConfigs[T],
    color: string,
    point: Point,
  ) => void;
  addPointToStroke: (point: Point) => void;
  endStrokeGroup: () => void;
  abortStrokeGroup: () => void;
  undo: () => void;
  redo: () => void;
  toggleRuler: () => void;
  showRuler: () => void;
  hideRuler: () => void;
  rotateRuler: (delta: number) => void;
  setRulerAngle: (angle: number) => void;
  startDragRuler: (point: Point) => void;
  dragRulerTo: (point: Point) => void;
  endDragRuler: () => void;
  autoCenter: (width: number, height: number) => void;
  stretchToFill: (width: number, height: number) => void;
}

type DocumentStore = DocumentStoreState & DocumentStoreActions;

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  document: null as unknown as Document,
  engine: null,
  _version: 0,
  _docListener: null,

  initDocument: (doc: Document) => {
    const { document: prevDoc, _docListener: prevListener } = get();
    if (prevDoc && prevListener) {
      prevDoc.offChange(prevListener);
    }

    const listener = () => set((s) => ({ _version: s._version + 1 }));
    doc.onChange(listener);

    set({ document: doc, _version: 0, engine: null, _docListener: listener });
  },

  setEngine: (engine) => set({ engine }),

  startStrokeGroup: () => {
    get().document.strokeHistory.startGroup();
  },

  startStroke: (tool, toolConfig, color, point) => {
    get().document.strokeHistory.startStroke(tool, toolConfig, color, point);
  },

  addPointToStroke: (point) => {
    get().document.strokeHistory.addPoint(point);
  },

  endStrokeGroup: () => {
    get().document.strokeHistory.endGroup();
    set((s) => ({ _version: s._version + 1 }));
  },

  abortStrokeGroup: () => {
    get().document.strokeHistory.abortGroup();
    set((s) => ({ _version: s._version + 1 }));
  },

  undo: () => {
    const { document, engine } = get();
    if (document.strokeHistory.canUndo()) {
      document.strokeHistory.undo();
      engine?.replayStrokes(
        {
          groups: document.strokeHistory.groups,
          currentIndex: document.strokeHistory.currentIndex,
        },
        (changed) => document.markAsChanged(changed),
      );
      set((s) => ({ _version: s._version + 1 }));
    }
  },

  redo: () => {
    const { document, engine } = get();
    if (document.strokeHistory.canRedo()) {
      document.strokeHistory.redo();
      engine?.replayStrokes(
        {
          groups: document.strokeHistory.groups,
          currentIndex: document.strokeHistory.currentIndex,
        },
        (changed) => document.markAsChanged(changed),
      );
      set((s) => ({ _version: s._version + 1 }));
    }
  },

  toggleRuler: () => {
    get().document.ruler.toggle();
    set((s) => ({ _version: s._version + 1 }));
  },

  showRuler: () => {
    get().document.ruler.show();
    set((s) => ({ _version: s._version + 1 }));
  },

  hideRuler: () => {
    get().document.ruler.hide();
    set((s) => ({ _version: s._version + 1 }));
  },

  rotateRuler: (delta) => {
    get().document.ruler.rotate(delta);
  },

  setRulerAngle: (angle) => {
    get().document.ruler.setAngle(angle);
    set((s) => ({ _version: s._version + 1 }));
  },

  startDragRuler: (point) => {
    get().document.ruler.startDrag(point);
    set((s) => ({ _version: s._version + 1 }));
  },

  dragRulerTo: (point) => {
    get().document.ruler.dragTo(point);
  },

  endDragRuler: () => {
    get().document.ruler.endDrag();
    set((s) => ({ _version: s._version + 1 }));
  },

  autoCenter: (width, height) => {
    get().document.autoCenter(width, height);
  },

  stretchToFill: (width, height) => {
    get().document.stretchToFill(width, height);
  },
}));
