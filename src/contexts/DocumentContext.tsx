import React, { useRef } from "react";
import type { CanvasEngine, Document, Ruler, StrokeHistory } from "~/core";
import { useDocumentStore } from "~/stores/useDocumentStore";
import type { Point } from "~/types";
import type { Tool, ToolConfigs } from "~/types/tools";

type StrokeHistorySnapshot = {
  groups: StrokeHistory["groups"];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
};

type DocumentContextValue = {
  document: Document;
  engine: CanvasEngine | null;
  strokeHistory: StrokeHistorySnapshot;
  ruler: Ruler;
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
};

type DocumentProviderProps = {
  document: Document;
  children: React.ReactNode;
};

export function DocumentProvider({
  document,
  children,
}: DocumentProviderProps) {
  const prevDocIdRef = useRef<string | null>(null);

  if (prevDocIdRef.current !== document.id) {
    prevDocIdRef.current = document.id;
    useDocumentStore.getState().initDocument(document);
  }

  return <>{children}</>;
}

export function useDocument(): DocumentContextValue {
  const state = useDocumentStore();
  const { document, engine } = state;

  return {
    document,
    engine,
    strokeHistory: {
      groups: document.strokeHistory.groups,
      currentIndex: document.strokeHistory.currentIndex,
      canUndo: document.strokeHistory.canUndo(),
      canRedo: document.strokeHistory.canRedo(),
    },
    ruler: document.ruler,
    startStrokeGroup: state.startStrokeGroup,
    startStroke: state.startStroke,
    addPointToStroke: state.addPointToStroke,
    endStrokeGroup: state.endStrokeGroup,
    abortStrokeGroup: state.abortStrokeGroup,
    undo: state.undo,
    redo: state.redo,
    toggleRuler: state.toggleRuler,
    showRuler: state.showRuler,
    hideRuler: state.hideRuler,
    rotateRuler: state.rotateRuler,
    setRulerAngle: state.setRulerAngle,
    startDragRuler: state.startDragRuler,
    dragRulerTo: state.dragRulerTo,
    endDragRuler: state.endDragRuler,
    autoCenter: state.autoCenter,
    stretchToFill: state.stretchToFill,
  };
}
