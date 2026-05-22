import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  dynamicBreadcrumbs: Record<string, string>;
}

const initialState: UiState = {
  dynamicBreadcrumbs: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBreadcrumbLabel: (
      state,
      action: PayloadAction<{ id: string; label: string }>
    ) => {
      state.dynamicBreadcrumbs[action.payload.id] = action.payload.label;
    },
    clearBreadcrumbLabel: (state, action: PayloadAction<string>) => {
      delete state.dynamicBreadcrumbs[action.payload];
    },
  },
});

export const { setBreadcrumbLabel, clearBreadcrumbLabel } = uiSlice.actions;
export default uiSlice.reducer;
