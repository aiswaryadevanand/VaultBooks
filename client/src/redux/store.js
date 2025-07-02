import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import { transactionApi } from '../api/transactionApi';
import reminderReducer from './slices/reminderSlice'


const store = configureStore({
  reducer: {
    auth: authReducer,
    wallets: walletReducer,
    transactions: transactionReducer,
    [transactionApi.reducerPath]: transactionApi.reducer, // ✅ Add this
    reminders: reminderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(transactionApi.middleware), // ✅ Add this
});

export default store;
