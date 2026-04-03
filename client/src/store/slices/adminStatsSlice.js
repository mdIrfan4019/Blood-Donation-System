import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

/* ======================================================
   FETCH ADMIN STATS
====================================================== */
export const fetchAdminStats = createAsyncThunk(
  "adminStats/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/admin/stats");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to load admin stats"
      );
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  "adminStats/fetchPendingRequests",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/admin/requests/pending");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to load pending requests"
      );
    }
  }
);

const adminStatsSlice = createSlice({
  name: "adminStats",

  initialState: {
    stats: null,
    pendingRequests: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminStatsSlice.reducer;
