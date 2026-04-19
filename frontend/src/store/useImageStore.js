import { create } from 'zustand';

export const defaultOperations = {
  resize: null,
  rotate: { angle: 0 },
  flip: null,
  brightness: 0,
  contrast: 1.0,
  grayscale: false,
  blur: 0,
  sharpen: 0.0,
  canny: null,
  sobel: false,
  crop: { left: 0, top: 0, right: 0, bottom: 0 },
};

const useImageStore = create((set, get) => ({
  originalFile: null,
  originalImageUrl: null,
  currentImageUrl: null,
  isProcessing: false,
  
  currentOperations: JSON.parse(JSON.stringify(defaultOperations)),
  historyStack: [],
  redoStack: [],
  cropModeActive: false,
  setCropMode: (val) => set({ cropModeActive: val }),

  setOriginalImage: (file) => {
    const url = URL.createObjectURL(file);
    set({
      originalFile: file,
      originalImageUrl: url,
      currentImageUrl: url,
      currentOperations: { ...defaultOperations },
      historyStack: [],
      redoStack: [],
    });
  },

  updateOperationsDraft: (partialOps) => {
    set((state) => ({
      currentOperations: { ...state.currentOperations, ...partialOps }
    }));
  },
  
  commitHistory: (snapshotOps) => {
    set((state) => ({
      historyStack: [...state.historyStack, JSON.parse(JSON.stringify(snapshotOps))],
      redoStack: []
    }));
  },

  jumpToHistory: (index) => {
    const { historyStack, currentOperations } = get();
    if (index < 0 || index >= historyStack.length) return;
    
    const newHistory = historyStack.slice(0, index);
    const targetOps = JSON.parse(JSON.stringify(historyStack[index]));
    // Everything after target in history, plus current, goes into redo so we don't lose it
    const removedFromHistory = historyStack.slice(index + 1);
    const newRedo = [...removedFromHistory, JSON.parse(JSON.stringify(currentOperations))].reverse();
    
    set({
      historyStack: newHistory,
      currentOperations: targetOps,
      redoStack: newRedo
    });
  },

  undo: () => {
    const { historyStack, currentOperations, redoStack } = get();
    if (historyStack.length === 0) return;
    const newHistory = [...historyStack];
    const prevOps = newHistory.pop();
    set({
      historyStack: newHistory,
      currentOperations: JSON.parse(JSON.stringify(prevOps)),
      redoStack: [...redoStack, JSON.parse(JSON.stringify(currentOperations))]
    });
  },

  redo: () => {
    const { historyStack, currentOperations, redoStack } = get();
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const nextOps = newRedo.pop();
    set({
      historyStack: [...historyStack, JSON.parse(JSON.stringify(currentOperations))],
      currentOperations: JSON.parse(JSON.stringify(nextOps)),
      redoStack: newRedo
    });
  },

  reset: () => {
    set((state) => {
      if (state.originalImageUrl === state.currentImageUrl) return state; // Already reset
      return {
        currentOperations: { ...defaultOperations },
        historyStack: [...state.historyStack, { ...state.currentOperations }],
        redoStack: []
      }
    });
  },

  resetTransform: () => set((state) => {
    const updated = { ...state.currentOperations, rotate: { angle: 0 }, flip: null, resize: null, crop: { left: 0, top: 0, right: 0, bottom: 0 } };
    return { historyStack: [...state.historyStack, JSON.parse(JSON.stringify(state.currentOperations))], currentOperations: updated, redoStack: [] };
  }),

  resetAdjustments: () => set((state) => {
    const updated = { ...state.currentOperations, brightness: 0, contrast: 1.0, grayscale: false };
    return { historyStack: [...state.historyStack, JSON.parse(JSON.stringify(state.currentOperations))], currentOperations: updated, redoStack: [] };
  }),

  resetFilters: () => set((state) => {
    const updated = { ...state.currentOperations, blur: 0, sharpen: 0.0, canny: null, sobel: false };
    return { historyStack: [...state.historyStack, JSON.parse(JSON.stringify(state.currentOperations))], currentOperations: updated, redoStack: [] };
  }),

  setCurrentImageUrl: (url) => {
    set((state) => {
      // release old object URL to prevent memory leaks if it's not the original
      if (state.currentImageUrl && state.currentImageUrl !== state.originalImageUrl && state.currentImageUrl !== url) {
        URL.revokeObjectURL(state.currentImageUrl);
      }
      return { currentImageUrl: url };
    });
  },
  setIsProcessing: (status) => set({ isProcessing: status })
}));

export default useImageStore;
