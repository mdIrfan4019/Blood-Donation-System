import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";
import { fetchHospitalRequests } from "../slices/hospitalSlice";

/* ======================================================
   MATCH DONOR THUNK
====================================================== */
export const matchDonorThunk = createAsyncThunk(
  "matching/match",
  async (requestId, thunkAPI) => {
    try {
      const res = await apiNode.post(`/matching/match/${requestId}`);

      // 🔥 FIX 2: Refresh hospital requests after match
      thunkAPI.dispatch(fetchHospitalRequests());

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Matching failed"
      );
    }
  }
);

/* ======================================================
   SLICE
====================================================== */
const matchingSlice = createSlice({
  name: "matching",
  initialState: {
    loading: false,
    matchedResult: null,
    error: null,
  },
  reducers: {
    clearMatchResult: (state) => {
      state.matchedResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(matchDonorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(matchDonorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedResult = action.payload;
      })
      .addCase(matchDonorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ======================================================
   EXPORTS
====================================================== */
export const { clearMatchResult } = matchingSlice.actions;
export default matchingSlice.reducer;
