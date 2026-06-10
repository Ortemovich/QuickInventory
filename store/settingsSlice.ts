import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// store
interface SettingsState {
  viewMode: 'list' | 'grid';
}

const initialState: SettingsState = {
  viewMode: 'list',
};

const settingsSlice = createSlice({ 
  name: 'settings',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<'list' | 'grid'>) { 
      state.viewMode = action.payload; 
    },
  },
});

export const { setViewMode } = settingsSlice.actions; // Action Creator // Redux Toolkit // она не вызывает саму функциб setViewMode, а возвращает объект действия bv.{ type: 'settings/setViewMode', payload: 'grid' }
export default settingsSlice.reducer;