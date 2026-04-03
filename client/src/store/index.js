import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import donorReducer from "./slices/donorSlice";
import recipientReducer from "./slices/recipientSlice";
import hospitalReducer from "./slices/hospitalSlice";
import bloodbankReducer from "./slices/bloodbankSlice";
import adminReducer from "./slices/adminSlice";
import matchingReducer from "./slices/matchingSlice";
import forecastReducer from "./slices/forecastSlice";
import adminDonationReducer from "./slices/adminDonationSlice";
import adminStatsReducer from "./slices/adminStatsSlice";
import notificationReducer from "./slices/notificationSlice";



export const store = configureStore({
  reducer: {
    auth: authReducer,
    donor: donorReducer,
    recipient: recipientReducer,
    hospital: hospitalReducer,
    bloodbank: bloodbankReducer,
    admin: adminReducer,
    matching: matchingReducer,
    forecast: forecastReducer, 
    adminDonations: adminDonationReducer,
    adminStats: adminStatsReducer,
    notifications: notificationReducer,

  },
});
