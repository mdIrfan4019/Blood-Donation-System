

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiNode from "../../services/apiNode";

// /* =========================
//    FETCH PENDING DONATIONS
// ========================= */
// export const fetchPendingDonations = createAsyncThunk(
//   "adminDonations/fetchPending",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await apiNode.get("/admin/donations/pending");
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch pending donations"
//       );
//     }
//   }
// );

// /* =========================
//    APPROVE DONATION
// ========================= */
// export const approveDonation = createAsyncThunk(
//   "adminDonations/approve",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await apiNode.patch(
//         `/admin/donations/approve/${id}`
//       );
//       return { id }; // 👈 only ID needed
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Approval failed"
//       );
//     }
//   }
// );

// export const rejectDonationThunk = createAsyncThunk(
//   "admin/rejectDonation",
//   async (id, thunkAPI) => {
//     try {
//       const res = await apiNode.patch(`/admin/donations/${id}/reject`);
//       thunkAPI.dispatch(fetchPendingDonations());
//       return res.data;
//     } catch (e) {
//       return thunkAPI.rejectWithValue(
//         e.response?.data?.message || "Reject failed"
//       );
//     }
//   }
// );


// const adminDonationSlice = createSlice({
//   name: "adminDonations",
//   initialState: {
//     pending: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder

//       /* FETCH */
//       .addCase(fetchPendingDonations.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchPendingDonations.fulfilled, (state, action) => {
//         state.loading = false;
//         state.pending = action.payload;
//       })
//       .addCase(fetchPendingDonations.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       /* APPROVE */
//       .addCase(approveDonation.fulfilled, (state, action) => {
//         state.pending = state.pending.filter(
//           (d) => d._id !== action.payload.id
//         );
//       })

//       /* REJECT */
// .addCase(rejectDonationThunk.pending, (state) => {
//   state.loading = true;
//   state.error = null;
// })
// .addCase(rejectDonationThunk.fulfilled, (state, action) => {
//   state.loading = false;

//   // remove rejected donation from pending list
//   state.pending = state.pending.filter((d) => d._id !== action.payload.id);
// })
// .addCase(rejectDonationThunk.rejected, (state, action) => {
//   state.loading = false;
//   state.error = action.payload;
// });

//   },
// });

// export default adminDonationSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

/* ===========================
   FETCH ALL DONATIONS
   GET /api/admin/donations/all
=========================== */
export const fetchAllDonations = createAsyncThunk(
  "adminDonations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiNode.get("/admin/donations/all");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch donations"
      );
    }
  }
);

/* ===========================
   APPROVE DONATION
   PATCH /api/admin/donations/approve/:id
=========================== */
export const approveDonation = createAsyncThunk(
  "adminDonations/approve",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiNode.patch(`/admin/donations/approve/${id}`);
      return res.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Donation approval failed"
      );
    }
  }
);

/* ===========================
   RECORD BLOOD TEST
   POST /api/admin/donation/record-test
=========================== */
export const recordBloodTest = createAsyncThunk(
  "adminDonation/recordTest",
  async ({ donationId, testResults }, thunkAPI) => {
    try {
      const res = await apiNode.post(`/admin/donations/test/${donationId}`, {
        results: testResults
      });

      // Refresh donations after recording test
      thunkAPI.dispatch(fetchAllDonations());

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Blood test recording failed"
      );
    }
  }
);

/* ===========================
   REJECT DONATION
   PATCH /api/admin/donations/:id/reject
=========================== */
export const rejectDonationThunk = createAsyncThunk(
  "adminDonations/reject",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiNode.patch(`/admin/donations/${id}/reject`);
      return res.data; 
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Reject failed"
      );
    }
  }
);

const adminDonationSlice = createSlice({
  name: "adminDonations",
  initialState: {
    pending: [],
    approved: [],
    rejected: [],
    loading: false,
    error: null,
  },

  reducers: {
    clearAdminDonationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===========================
         FETCH ALL DONATIONS
      =========================== */
      .addCase(fetchAllDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDonations.fulfilled, (state, action) => {
        state.loading = false;

        const all = action.payload || [];

        state.pending = all.filter((d) => d.status === "pending");
        state.approved = all.filter((d) => d.status === "approved");
        state.rejected = all.filter((d) => d.status === "rejected");
      })
      .addCase(fetchAllDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         APPROVE DONATION
      =========================== */
      .addCase(approveDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveDonation.fulfilled, (state, action) => {
        state.loading = false;

        const approvedDonation = action.payload?.donation;

        if (approvedDonation) {
          // remove from pending
          state.pending = state.pending.filter(
            (d) => d._id !== approvedDonation._id
          );

          // add into approved list
          state.approved.unshift(approvedDonation);
        }
      })
      .addCase(approveDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         REJECT DONATION
      =========================== */
      .addCase(rejectDonationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectDonationThunk.fulfilled, (state, action) => {
        state.loading = false;

        const rejectedDonation = action.payload?.donation;

        if (rejectedDonation) {
          // remove from pending
          state.pending = state.pending.filter(
            (d) => d._id !== rejectedDonation._id
          );

          // add into rejected list
          state.rejected.unshift(rejectedDonation);
        }
      })
      .addCase(rejectDonationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminDonationError } = adminDonationSlice.actions;
export default adminDonationSlice.reducer;
