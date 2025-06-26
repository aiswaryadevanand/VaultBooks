import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import { transactionApi } from '../api/transactionApi';


const store = configureStore({
  reducer: {
    auth: authReducer,
    wallets: walletReducer,
    transactions: transactionReducer,
    [transactionApi.reducerPath]: transactionApi.reducer, // ✅ Add this
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(transactionApi.middleware), // ✅ Add this
});

export default store;
