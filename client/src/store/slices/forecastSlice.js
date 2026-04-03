import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

// ✅ Node API call (Node will call Python internally)
export const forecastDemandThunk = createAsyncThunk(
  "forecast/predict",
  async ({ bloodGroup, days, type }, thunkAPI) => {
    try {
      const res = await apiNode.post("/admin/forecast", {
        bloodGroup,
        days,
        type,
      });

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Forecast failed"
      );
    }
  }
);

const forecastSlice = createSlice({
  name: "forecast",
  initialState: {
    loading: false,
    result: null,
    error: null,
  },
  reducers: {
    clearForecast: (state) => {
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forecastDemandThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forecastDemandThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(forecastDemandThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearForecast } = forecastSlice.actions;
export default forecastSlice.reducer;
