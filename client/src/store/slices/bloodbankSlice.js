import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

/* =========================
   FETCH INVENTORY
========================= */
export const fetchInventory = createAsyncThunk(
  "bloodbank/fetchInventory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiNode.get("/bloodbank/inventory");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch inventory"
      );
    }
  }
);

/* =========================
   BLOOD BANK PROFILE
========================= */
export const fetchBloodBankProfile = createAsyncThunk(
  "bloodbank/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiNode.get("/bloodbank/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const updateBloodBankProfile = createAsyncThunk(
  "bloodbank/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await apiNode.post("/bloodbank/profile", profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update profile");
    }
  }
);

const bloodbankSlice = createSlice({
  name: "bloodbank",
  initialState: {
    items: [],
    loading: false,
    error: null,
    success: null,

    // Profile
    profile: null,
    profileLoading: false,
    profileError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* FETCH INVENTORY */
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* BLOOD BANK PROFILE */
      .addCase(fetchBloodBankProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchBloodBankProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchBloodBankProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      .addCase(updateBloodBankProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBloodBankProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Profile updated successfully";
        state.profile = action.payload.profile;
      })
      .addCase(updateBloodBankProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default bloodbankSlice.reducer;
