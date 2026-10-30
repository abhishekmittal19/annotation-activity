import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedObjectId: null,
  activeClassLabel: "Car",
  toolMode: "SELECT",
  zoomLevel: 100,
  panOffset: { x: 0, y: 0 },
  showDiffOverlay: false,
  diffRevisionVersion: null,
  annotations: [],
  historyUndo: [],
  historyRedo: [],
};

export const annotationSlice = createSlice({
  name: "annotation",
  initialState,
  reducers: {
    setInitialAnnotations: (state, action) => {
      state.annotations = action.payload;
      state.historyUndo = [];
      state.historyRedo = [];
      state.selectedObjectId = null;
    },
    setSelectedObjectId: (state, action) => {
      state.selectedObjectId = action.payload;
    },
    setActiveClassLabel: (state, action) => {
      state.activeClassLabel = action.payload;
    },
    setToolMode: (state, action) => {
      state.toolMode = action.payload;
    },
    setZoomLevel: (state, action) => {
      state.zoomLevel = Math.max(25, Math.min(400, action.payload));
    },
    setPanOffset: (state, action) => {
      state.panOffset = action.payload;
    },
    setShowDiffOverlay: (state, action) => {
      state.showDiffOverlay = action.payload;
    },
    setDiffRevisionVersion: (state, action) => {
      state.diffRevisionVersion = action.payload;
    },
    addAnnotation: (state, action) => {
      state.historyUndo.push(state.annotations);
      state.historyRedo = [];
      state.annotations.push(action.payload);
      state.selectedObjectId = action.payload.id;
    },
    updateAnnotation: (state, action) => {
      const idx = state.annotations.findIndex(
        (a) => a.id === action.payload.id,
      );
      if (idx !== -1) {
        state.historyUndo.push(state.annotations);
        state.historyRedo = [];
        state.annotations[idx] = action.payload;
      }
    },
    deleteAnnotation: (state, action) => {
      state.historyUndo.push(state.annotations);
      state.historyRedo = [];
      state.annotations = state.annotations.filter(
        (a) => a.id !== action.payload,
      );
      if (state.selectedObjectId === action.payload) {
        state.selectedObjectId = null;
      }
    },
    undo: (state) => {
      if (state.historyUndo.length > 0) {
        const previous = state.historyUndo.pop();
        state.historyRedo.push(state.annotations);
        state.annotations = previous;
      }
    },
    redo: (state) => {
      if (state.historyRedo.length > 0) {
        const next = state.historyRedo.pop();
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
