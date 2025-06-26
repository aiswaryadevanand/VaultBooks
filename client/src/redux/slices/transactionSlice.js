import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    selectedTransaction: null,
  },
  reducers: {
    setSelectedTransaction: (state, action) => {
      state.selectedTransaction = action.payload;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
  },
});

export const { setSelectedTransaction, clearSelectedTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
