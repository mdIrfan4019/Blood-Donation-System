import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

/* ===========================
   FETCH USERS
=========================== */
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/admin/users");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

/* ===========================
   DELETE USER
=========================== */
export const deleteUserThunk = createAsyncThunk(
  "admin/deleteUser",
  async (id, thunkAPI) => {
    try {
      const res = await apiNode.delete(`/admin/users/${id}`);
      thunkAPI.dispatch(fetchUsers());
      return res.data.message;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

/* ===========================
   BLOCK USER
=========================== */
export const blockUserThunk = createAsyncThunk(
  "admin/blockUser",
  async (id, thunkAPI) => {
    try {
      const res = await apiNode.patch(`/admin/users/${id}/block`);
      thunkAPI.dispatch(fetchUsers());
      return res.data.message;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to block user"
      );
    }
  }
);

/* ===========================
   UNBLOCK USER
=========================== */
export const unblockUserThunk = createAsyncThunk(
  "admin/unblockUser",
  async (id, thunkAPI) => {
    try {
      const res = await apiNode.patch(`/admin/users/${id}/unblock`);
      thunkAPI.dispatch(fetchUsers());
      return res.data.message;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to unblock user"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearAdminStatus: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH USERS
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.success = action.payload;
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // BLOCK
      .addCase(blockUserThunk.fulfilled, (state, action) => {
        state.success = action.payload;
      })
      .addCase(blockUserThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UNBLOCK
      .addCase(unblockUserThunk.fulfilled, (state, action) => {
        state.success = action.payload;
      })
      .addCase(unblockUserThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;
