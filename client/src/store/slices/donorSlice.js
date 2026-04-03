import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";
import apiPython from "../../services/apiPython";

/* ======================================================
   THUNKS
====================================================== */

/* --------------------
   Fetch Donor Dashboard
-------------------- */
export const fetchDonorDashboard = createAsyncThunk(
  "donor/dashboard",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/donor/dashboard");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to load dashboard"
      );
    }
  }
);

/* --------------------
   Save / Update Donor Profile
-------------------- */
export const saveDonorProfile = createAsyncThunk(
  "donor/saveProfile",
  async (payload, thunkAPI) => {
    try {
      const res = await apiNode.post("/donor/profile", payload);

      // refresh dashboard after profile save
      thunkAPI.dispatch(fetchDonorDashboard());

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Profile save failed"
      );
    }
  }
);

/* --------------------
   Check Eligibility (AI Service)
-------------------- */
export const checkEligibility = createAsyncThunk(
  "donor/eligibility",
  async (payload, thunkAPI) => {
    try {
      const res = await apiPython.post("/predict/eligibility", payload);
      return res.data;
    } catch (e) {
      const message =
        e.response?.data?.reason ||
        e.response?.data?.error ||
        "Eligibility check failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* --------------------
   Donate Blood
-------------------- */
export const donateBloodThunk = createAsyncThunk(
  "donor/donate",
  async (payload, thunkAPI) => {
    try {
      const res = await apiNode.post("/donor/donate", payload);

      // refresh dashboard after donation
      thunkAPI.dispatch(fetchDonorDashboard());

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Donation failed"
      );
    }
  }
);

/* ======================================================
   SLICE
====================================================== */

const donorSlice = createSlice({
  name: "donor",

  initialState: {
    dashboard: null,

    eligibility: localStorage.getItem("donorEligibility")
      ? JSON.parse(localStorage.getItem("donorEligibility"))
      : null,

    dashboardLoading: false,
    profileLoading: false,
    eligibilityLoading: false,
    donationLoading: false,

    error: null,
    success: null,
  },

  reducers: {
    clearEligibility: (state) => {
      state.eligibility = null;
      state.error = null;
      localStorage.removeItem("donorEligibility");
    },

    clearDonorStatus: (state) => {
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================
         DASHBOARD
      ===================== */
      .addCase(fetchDonorDashboard.pending, (s) => {
        s.dashboardLoading = true;
        s.error = null;
      })
      .addCase(fetchDonorDashboard.fulfilled, (s, a) => {
        s.dashboardLoading = false;
        s.dashboard = a.payload;
      })
      .addCase(fetchDonorDashboard.rejected, (s, a) => {
        s.dashboardLoading = false;
        s.error = a.payload;
      })

      /* =====================
         SAVE PROFILE
      ===================== */
      .addCase(saveDonorProfile.pending, (s) => {
        s.profileLoading = true;
        s.error = null;
        s.success = null;
      })
      .addCase(saveDonorProfile.fulfilled, (s) => {
        s.profileLoading = false;
        s.success = "Profile saved successfully";
      })
      .addCase(saveDonorProfile.rejected, (s, a) => {
        s.profileLoading = false;
        s.error = a.payload;
      })

      /* =====================
         ELIGIBILITY
      ===================== */
      .addCase(checkEligibility.pending, (s) => {
        s.eligibilityLoading = true;
        s.error = null;
        s.success = null;
      })
      .addCase(checkEligibility.fulfilled, (s, a) => {
        s.eligibilityLoading = false;
        s.eligibility = a.payload;

        // persist eligibility
        localStorage.setItem("donorEligibility", JSON.stringify(a.payload));
      })
      .addCase(checkEligibility.rejected, (s, a) => {
        s.eligibilityLoading = false;
        s.error = a.payload;
      })

      /* =====================
         DONATION
      ===================== */
      .addCase(donateBloodThunk.pending, (s) => {
        s.donationLoading = true;
        s.error = null;
        s.success = null;
      })
      .addCase(donateBloodThunk.fulfilled, (s, a) => {
        s.donationLoading = false;
        s.success = a.payload.message;

        // reset eligibility after donation
        s.eligibility = null;
        localStorage.removeItem("donorEligibility");
      })
      .addCase(donateBloodThunk.rejected, (s, a) => {
        s.donationLoading = false;
        s.error = a.payload;
      });
  },
});

/* ======================================================
   EXPORTS
====================================================== */

export const { clearEligibility, clearDonorStatus } = donorSlice.actions;

export default donorSlice.reducer;
