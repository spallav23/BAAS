import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import clusterReducer from './slices/clusterSlice'
import storageReducer from './slices/storageSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clusters: clusterReducer,
    storage: storageReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

