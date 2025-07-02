import { createSlice } from "@reduxjs/toolkit";

const reminderSlice = createSlice({
  name: "reminders",
  initialState: {
    dueCount: 0,
  },
  reducers: {
    setDueCount: (state, action) => {
      state.dueCount = action.payload;
    },
    decrementDueCount: (state) => {
      if (state.dueCount > 0) {
        state.dueCount -= 1;
      }
    },
    incrementDueCount: (state) => {
      state.dueCount += 1;
    },
  },
});

export const { setDueCount, decrementDueCount, incrementDueCount } = reminderSlice.actions;
export default reminderSlice.reducer;
