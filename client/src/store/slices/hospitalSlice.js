import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiNode from "../../services/apiNode";

/* ===========================
   FETCH HOSPITAL REQUESTS
=========================== */
export const fetchHospitalRequests = createAsyncThunk(
  "hospital/requests",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/requests");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to fetch hospital requests",
      );
    }
  },
);

/* ===========================
   FETCH TESTING HISTORY (LAB)
=========================== */
export const fetchTestingHistoryThunk = createAsyncThunk(
  "hospital/fetchTestingHistory",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/lab/history");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch testing history");
    }
  }
);

/* ===========================
   FETCH INVENTORY FOR REQUEST (COMPATIBILITY)
   GET /api/hospital/inventory/:bloodGroup
=========================== */
export const fetchInventoryForRequest = createAsyncThunk(
  "hospital/inventoryCheck",
  async (bloodGroup, thunkAPI) => {
    try {
      const res = await apiNode.get(`/hospital/inventory/${bloodGroup}`);

      return {
        bloodGroup,
        data: res.data,
      };
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Failed to check inventory",
      );
    }
  },
);

/* ===========================
   FULFILL REQUEST FROM INVENTORY (MULTI GROUP SPLIT)
   PATCH /api/hospital/fulfill/:id
=========================== */
export const fulfillRequestThunk = createAsyncThunk(
  "hospital/fulfill",
  async (requestId, thunkAPI) => {
    try {
      const res = await apiNode.patch(`/hospital/fulfill/${requestId}`);

      // refresh hospital requests after fulfill
      thunkAPI.dispatch(fetchHospitalRequests());

      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "Fulfillment failed",
      );
    }
  },
);/* ===========================
   HOSPITAL PROFILE
=========================== */
export const fetchHospitalProfile = createAsyncThunk(
  "hospital/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/profile");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const updateHospitalProfile = createAsyncThunk(
  "hospital/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/profile", profileData);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to update profile");
    }
  }
);

/* ===========================
   STAFF MANAGEMENT
=========================== */
export const addStaffThunk = createAsyncThunk(
  "hospital/addStaff",
  async (staffData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/staff", staffData);
      thunkAPI.dispatch(fetchStaffThunk());
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to add staff");
    }
  }
);

export const fetchStaffThunk = createAsyncThunk(
  "hospital/fetchStaff",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/staff");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch staff");
    }
  }
);

/* ===========================
   DONATION APPROVAL
=========================== */
export const approveDonationThunk = createAsyncThunk(
  "hospital/approveDonation",
  async (donationId, thunkAPI) => {
    try {
      const res = await apiNode.patch(`/hospital/donation/approve/${donationId}`);
      thunkAPI.dispatch(fetchHospitalRequests());
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to approve donation");
    }
  }
);

/* ===========================
   DONATION CLAIMING
=========================== */
export const claimDonationThunk = createAsyncThunk(
  "hospital/claimDonation",
  async (donationId, thunkAPI) => {
    try {
      const res = await apiNode.patch(`/hospital/donation/claim/${donationId}`);
      thunkAPI.dispatch(fetchHospitalRequests());
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to claim donation");
    }
  }
);

/* ===========================
   LAB TESTING
=========================== */
export const submitLabResultsThunk = createAsyncThunk(
  "hospital/submitLabResults",
  async (testData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/lab/test", testData);
      thunkAPI.dispatch(fetchHospitalRequests());
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to submit lab results");
    }
  }
);

/* ===========================
   PATIENT REGISTRATION
=========================== */
export const registerPatientThunk = createAsyncThunk(
  "hospital/registerPatient",
  async (patientData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/patient/register", patientData);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to register patient");
    }
  }
);

/* ===========================
   DOCTOR BLOOD REQUEST
=========================== */
export const requestBloodThunk = createAsyncThunk(
  "hospital/requestBlood",
  async (requestData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/doctor/request", requestData);
      thunkAPI.dispatch(fetchDoctorRequestsThunk()); // Refresh after new request
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to request blood");
    }
  }
);

export const fetchDoctorRequestsThunk = createAsyncThunk(
  "hospital/fetchDoctorRequests",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/doctor/requests");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch requests");
    }
  }
);

export const completeRequestThunk = createAsyncThunk(
  "hospital/completeRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await apiNode.patch(`/hospital/doctor/complete/${requestId}`);
      thunkAPI.dispatch(fetchDoctorRequestsThunk());
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to complete request");
    }
  }
);

/* ===========================
   HOSPITAL INVENTORY
=========================== */
export const fetchInventoryThunk = createAsyncThunk(
  "hospital/fetchInventory",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/inventory");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch inventory");
    }
  }
);

/* ===========================
   BLOOD CAMPS
=========================== */
export const fetchMyCampsThunk = createAsyncThunk(
  "hospital/fetchMyCamps",
  async (_, thunkAPI) => {
    try {
      const res = await apiNode.get("/hospital/camp/my");
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch camps");
    }
  }
);

export const createCampThunk = createAsyncThunk(
  "hospital/createCamp",
  async (campData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/camp", campData);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to create camp");
    }
  }
);

export const addInventoryThunk = createAsyncThunk(
  "hospital/addInventory",
  async (inventoryData, thunkAPI) => {
    try {
      const res = await apiNode.post("/hospital/inventory", inventoryData);
      return res.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to add inventory item");
    }
  }
);

const hospitalSlice = createSlice({
  name: "hospital",
  initialState: {
    requests: [],
    inventory: [],
    loading: false,
    error: null,
    success: null,
    fulfillResult: null,
    inventoryCheck: {},
    profile: null,
    profileLoading: false,
    profileError: null,
    camps: [],
    staff: [],
    doctorRequests: [],
    testingHistory: [],
  },

  reducers: {
    clearHospitalStatus: (state) => {
      state.error = null;
      state.success = null;
      state.fulfillResult = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===========================
         FETCH REQUESTS
      =========================== */
      .addCase(fetchHospitalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHospitalRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchHospitalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         FETCH INVENTORY CHECK
      =========================== */
      .addCase(fetchInventoryForRequest.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchInventoryForRequest.fulfilled, (state, action) => {
        state.inventoryCheck[action.payload.bloodGroup] = action.payload.data;
      })
      .addCase(fetchInventoryForRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ===========================
         FULFILL REQUEST
      =========================== */
      .addCase(fulfillRequestThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
        state.fulfillResult = null;
      })
      .addCase(fulfillRequestThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.fulfillResult = action.payload;

        // update inventory check cache after fulfill
        const reqBloodGroup = action.payload.request?.bloodGroup;
        if (reqBloodGroup && state.inventoryCheck[reqBloodGroup]) {
          state.inventoryCheck[reqBloodGroup].totalAvailable =
            action.payload.totalRemaining;
        }
      })
      .addCase(fulfillRequestThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===========================
         HOSPITAL PROFILE
      =========================== */
      .addCase(fetchHospitalProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchHospitalProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchHospitalProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      .addCase(updateHospitalProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateHospitalProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Profile updated successfully";
        state.profile = action.payload;
      })
      .addCase(updateHospitalProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         HOSPITAL INVENTORY
      =========================== */
      .addCase(fetchInventoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(fetchInventoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addInventoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addInventoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Inventory item added successfully";
        state.inventory.unshift(action.payload);
      })
      .addCase(addInventoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===========================
         BLOOD CAMPS
      =========================== */
      .addCase(fetchMyCampsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCampsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.camps = action.payload;
      })
      .addCase(fetchMyCampsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCampThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCampThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Camp created successfully! ⛺";
        state.camps.unshift(action.payload);
      })
      .addCase(createCampThunk.rejected, (action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         STAFF MANAGEMENT
      =========================== */
      .addCase(addStaffThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addStaffThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Staff registered successfully! 👨‍⚕️";
      })
      .addCase(addStaffThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         DONATION APPROVAL
      =========================== */
      .addCase(approveDonationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(approveDonationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Approved for Lab Testing! 🔬";
      })
      .addCase(approveDonationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===========================
         DONATION CLAIMING
      =========================== */
      .addCase(claimDonationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(claimDonationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Donation claimed successfully! 🔬";
      })
      .addCase(claimDonationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===========================
         LAB TESTING
      =========================== */
      .addCase(submitLabResultsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitLabResultsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || "Results submitted successfully! 📋";
      })
      .addCase(submitLabResultsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         PATIENT REGISTRATION
      =========================== */
      .addCase(registerPatientThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerPatientThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Patient registered successfully! 🏥";
      })
      .addCase(registerPatientThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         DOCTOR BLOOD REQUEST
      =========================== */
      .addCase(requestBloodThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(requestBloodThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Blood request processed! 🚚";
      })
      .addCase(requestBloodThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         FETCH STAFF
      =========================== */
      .addCase(fetchStaffThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaffThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===========================
         DOCTOR DASHBOARD
      =========================== */
      .addCase(fetchDoctorRequestsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorRequestsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorRequests = action.payload;
      })
      .addCase(fetchDoctorRequestsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeRequestThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(completeRequestThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || "Blood handover completed! ✅";
      })
      .addCase(completeRequestThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===========================
         FETCH TESTING HISTORY (LAB)
      =========================== */
      .addCase(fetchTestingHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestingHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.testingHistory = action.payload;
      })
      .addCase(fetchTestingHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHospitalStatus } = hospitalSlice.actions;
export default hospitalSlice.reducer;
