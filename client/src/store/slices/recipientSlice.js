// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import apiNode from "../../services/apiNode";

// /* ================================
//    THUNKS
// ================================ */

// // CREATE REQUEST
// export const createBloodRequest = createAsyncThunk(
//   "recipient/request",
//   async (data, { rejectWithValue }) => {
//     try {
//       const res = await apiNode.post("/recipient/request", data);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Request failed"
//       );
//     }
//   }
// );

// // FETCH MY REQUESTS
// export const fetchMyRequests = createAsyncThunk(
//   "recipient/requests",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await apiNode.get("/recipient/my-requests");
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Failed to fetch requests"
//       );
//     }
//   }
// );

// /* ================================
//    SLICE
// ================================ */

// const recipientSlice = createSlice({
//   name: "recipient",
//   initialState: {
//     loading: false,
//     success: false,
//     error: null,
//     requests: [],
//   },
//   reducers: {
//     clearRecipientStatus: (state) => {
//       state.success = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder

//       // CREATE REQUEST
//       .addCase(createBloodRequest.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createBloodRequest.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = true;
//         state.requests.push(action.payload); // instant UI update
//       })
//       .addCase(createBloodRequest.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // FETCH REQUESTS
//       .addCase(fetchMyRequests.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchMyRequests.fulfilled, (state, action) => {
//         state.loading = false;
//         state.requests = action.payload;
//       })
//       .addCase(fetchMyRequests.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearRecipientStatus } = recipientSlice.actions;
// export default recipientSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

/* ================================
   CREATE REQUEST
================================ */
export const createBloodRequest = createAsyncThunk(
  "recipient/createRequest",
  async (data, thunkAPI) => {
    try {
      const res = await apiNode.post("/recipient/request", data);

      // ✅ refresh list after creating request
      thunkAPI.dispatch(fetchMyRequests());

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Request failed"
      );
    }
  }
);

/* ================================
   FETCH MY REQUESTS
================================ */
export const fetchMyRequests = createAsyncThunk(
  "recipient/fetchMyRequests",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/recipient/my-requests");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch requests"
      );
    }
  }
);

/* ================================
   SLICE
================================ */
const recipientSlice = createSlice({
  name: "recipient",
  initialState: {
    loading: false,
    error: null,
    success: null,
    requests: [],
  },
  reducers: {
    clearRecipientStatus: (state) => {
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE REQUEST
      .addCase(createBloodRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createBloodRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = "Request created successfully";
      })
      .addCase(createBloodRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH REQUESTS
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecipientStatus } = recipientSlice.actions;
export default recipientSlice.reducer;
