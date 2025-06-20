import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import productsReducer from './productsSlice';
import authReducer from './services/auth-service'; // 👈 this is your auth slice

// 👇 Step 1: Combine all reducers
const rootReducer = combineReducers({
  products: productsReducer,
  authentification: authReducer, // 👈 add this
});

// 👇 Step 2: Configure persistence
const persistConfig = {
  key: 'root', // name in AsyncStorage
  storage: AsyncStorage, // use AsyncStorage
  whitelist: ['authentification'], // 👈 only save this part
};

// 👇 Step 3: Make reducer persistent
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 👇 Step 4: Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 👈 required
    }),
});

// 👇 Step 5: Create the persistor
export const persistor = persistStore(store);

// Type helpers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
