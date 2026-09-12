import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnnotationObject } from '@/types/task';

export type ToolMode = 'SELECT' | 'RECTANGLE' | 'PAN' | 'ZOOM' | 'QA_PIN';

interface AnnotationWorkspaceState {
  selectedObjectId: string | null;
  activeClassLabel: string;
  toolMode: ToolMode;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  showDiffOverlay: boolean;
  diffRevisionVersion: number | null;
  annotations: AnnotationObject[];
  historyUndo: AnnotationObject[][];
  historyRedo: AnnotationObject[][];
}

const initialState: AnnotationWorkspaceState = {
  selectedObjectId: null,
  activeClassLabel: 'Car',
  toolMode: 'SELECT',
  zoomLevel: 100,
  panOffset: { x: 0, y: 0 },
  showDiffOverlay: false,
  diffRevisionVersion: null,
  annotations: [],
  historyUndo: [],
  historyRedo: [],
};

export const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {
    setInitialAnnotations: (state, action: PayloadAction<AnnotationObject[]>) => {
      state.annotations = action.payload;
      state.historyUndo = [];
      state.historyRedo = [];
      state.selectedObjectId = null;
    },
    setSelectedObjectId: (state, action: PayloadAction<string | null>) => {
      state.selectedObjectId = action.payload;
    },
    setActiveClassLabel: (state, action: PayloadAction<string>) => {
      state.activeClassLabel = action.payload;
    },
    setToolMode: (state, action: PayloadAction<ToolMode>) => {
      state.toolMode = action.payload;
    },
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = Math.max(25, Math.min(400, action.payload));
    },
    setPanOffset: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.panOffset = action.payload;
    },
    setShowDiffOverlay: (state, action: PayloadAction<boolean>) => {
      state.showDiffOverlay = action.payload;
    },
    setDiffRevisionVersion: (state, action: PayloadAction<number | null>) => {
      state.diffRevisionVersion = action.payload;
    },
    addAnnotation: (state, action: PayloadAction<AnnotationObject>) => {
      state.historyUndo.push(state.annotations);
      state.historyRedo = [];
      state.annotations.push(action.payload);
      state.selectedObjectId = action.payload.id;
    },
    updateAnnotation: (state, action: PayloadAction<AnnotationObject>) => {
      const idx = state.annotations.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.historyUndo.push(state.annotations);
        state.historyRedo = [];
        state.annotations[idx] = action.payload;
      }
    },
    deleteAnnotation: (state, action: PayloadAction<string>) => {
      state.historyUndo.push(state.annotations);
      state.historyRedo = [];
      state.annotations = state.annotations.filter((a) => a.id !== action.payload);
      if (state.selectedObjectId === action.payload) {
        state.selectedObjectId = null;
      }
    },
    undo: (state) => {
      if (state.historyUndo.length > 0) {
        const previous = state.historyUndo.pop()!;
        state.historyRedo.push(state.annotations);
        state.annotations = previous;
      }
    },
    redo: (state) => {
      if (state.historyRedo.length > 0) {
        const next = state.historyRedo.pop()!;
        state.historyUndo.push(state.annotations);
        state.annotations = next;
      }
    },
    resetWorkspace: (state) => {
      state.selectedObjectId = null;
      state.zoomLevel = 100;
      state.panOffset = { x: 0, y: 0 };
      state.showDiffOverlay = false;
      state.diffRevisionVersion = null;
      state.historyUndo = [];
      state.historyRedo = [];
    },
  },
});

export const {
  setInitialAnnotations,
  setSelectedObjectId,
  setActiveClassLabel,
  setToolMode,
  setZoomLevel,
  setPanOffset,
  setShowDiffOverlay,
  setDiffRevisionVersion,
  addAnnotation,
  updateAnnotation,
  deleteAnnotation,
  undo,
  redo,
  resetWorkspace,
} = annotationSlice.actions;

export default annotationSlice.reducer;
