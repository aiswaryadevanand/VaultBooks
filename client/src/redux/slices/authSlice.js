import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Optionally persist to localStorage
      localStorage.setItem('vault_token', action.payload.token);
      localStorage.setItem('vault_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('vault_token');
      localStorage.removeItem('vault_user');
    },
    loadStoredCredentials: (state) => {
      const token = localStorage.getItem('vault_token');
      const user = localStorage.getItem('vault_user');
      if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
      }
    }
  },
});

export const { setCredentials, logout, loadStoredCredentials } = authSlice.actions;
export default authSlice.reducer;
