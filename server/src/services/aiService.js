import axios from "axios";

// ------------------
// DONOR ELIGIBILITY
// ------------------
export const checkEligibilityAI = async (payload) => {
  const res = await axios.post(
    `${process.env.AI_SERVICE_URL}/predict/eligibility`,
    payload
  );
  return res.data;
};

// ------------------
// DEMAND FORECASTING
// ------------------
export const forecastDemandAI = async (history) => {
  const res = await axios.post(
    `${process.env.AI_SERVICE_URL}/predict/demand`,
    { history }
  );
  return res.data;
};
