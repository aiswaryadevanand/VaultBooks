import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchWallets = createAsyncThunk('wallets/fetchWallets', 
    async (_, { rejectWithValue , getState}) => {
        try {
            const {auth}= getState();
            const res=await axios.get('http://localhost:5000/api/wallets', {
                headers: {
                    authorization: `Bearer ${auth.token}`,
                },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.message);
        }
    }
);

export const createWallet = createAsyncThunk('wallets/createWallet', 
    async (walletData, { rejectWithValue, getState }) => {
        try {
            const {auth} = getState();
            const res = await axios.post('http://localhost:5000/api/wallets', walletData, {
                headers: {
                    authorization: `Bearer ${auth.token}`,
                },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.message);
        }
    }
);

export const updateWallet = createAsyncThunk('wallets/updateWallet',
    async({ id, name, type }, { rejectWithValue, getState }) => {
        try{
            const {auth} = getState();
            const res = await axios.put(`http://localhost:5000/api/wallets/${id}`, { name, type }, {
                headers: {
                    authorization: `Bearer ${auth.token}`,
                },
            });
            return res.data;
        }catch (err) {
            return rejectWithValue(err.response?.data?.error || err.message);   
        }
    }
);

export const deleteWallet = createAsyncThunk('wallets/deleteWallet',
    async (id, { rejectWithValue, getState }) => {
        try {
            const {auth} = getState();
            await axios.delete(`http://localhost:5000/api/wallets/${id}`, {
                headers: {
                    authorization: `Bearer ${auth.token}`,
                },
            });
            return id; // Return the ID of the deleted wallet
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.message);
        }
    }
);



const walletSlice = createSlice({
    name: 'wallets',
    initialState: {
        wallets: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        resetWalletState: (state) => {
            state.wallets = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchWallets.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWallets.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.wallets = action.payload;
            })
            .addCase(fetchWallets.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(createWallet.fulfilled, (state,action) => {
                state.wallets.push(action.payload);
            })
            .addCase(createWallet.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateWallet.fulfilled, (state, action) => {
                const index = state.wallets.findIndex(w => w._id === action.payload._id);
                if (index !== -1) {
                    state.wallets[index] = action.payload;
                }
            })
            .addCase(updateWallet.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteWallet.fulfilled, (state, action) => {
                state.wallets = state.wallets.filter(w => w._id !== action.payload);
            })
            .addCase(deleteWallet.rejected, (state, action) => {
                state.error = action.payload;
            });
        },
    });
export const { resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
