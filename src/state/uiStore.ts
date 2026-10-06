import { create } from 'zustand';

interface UiState {
  selectedCategoryId: string | null;
  toastMessage: string | null;
  toastTone: 'success' | 'error';
  selectCategory: (categoryId: string | null) => void;
  showToast: (message: string, tone?: 'success' | 'error') => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedCategoryId: null,
  toastMessage: null,
  toastTone: 'success',
  selectCategory: (selectedCategoryId) => set({ selectedCategoryId }),
  showToast: (toastMessage, toastTone = 'success') => set({ toastMessage, toastTone }),
  clearToast: () => set({ toastMessage: null }),
}));
