import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Localization from 'expo-localization';

interface LangState {
  language: "en" | "fr" | "ar";
}

// Initialize with device language or fallback to 'en'
const deviceLanguage = Localization.locale?.split('-')[0] || 'en';
const initialLanguage = ['en', 'fr', 'ar'].includes(deviceLanguage) 
  ? deviceLanguage as "en" | "fr" | "ar" 
  : 'en';

const initialState: LangState = {
  language: initialLanguage,
};

const langSlice = createSlice({
  name: "lang",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"en" | "fr" | "ar">) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = langSlice.actions;
export const selectLanguage = (state: any) => state.lang.language;
export default langSlice.reducer;