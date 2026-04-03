import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkEligibility, clearEligibility } from "../../store/slices/donorSlice";
import { useNavigate } from "react-router-dom";

export default function EligibilityForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    hb: "",
    age: "",
    bp: "",
    weight: "",
    height: "",
  });

  const { eligibility, loading, error } = useSelector((s) => s.donor);

  const submit = () => {
    dispatch(
      checkEligibility({
        hb: Number(form.hb),
        age: Number(form.age),
        bp: Number(form.bp),
        weight: Number(form.weight),
        height: Number(form.height),
      })
    );
  };

  // ✅ Reset Form + Clear Redux Eligibility Report
  const handleCheckAgain = () => {
    dispatch(clearEligibility());

    setForm({
      hb: "",
      age: "",
      bp: "",
      weight: "",
      height: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Donor Eligibility Check 🧪
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your health details to check eligibility
          </p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hemoglobin (g/dL)"
            value={form.hb}
            onChange={(v) => setForm({ ...form, hb: v })}
          />
          <Input
            label="Age (years)"
            value={form.age}
            onChange={(v) => setForm({ ...form, age: v })}
          />
          <Input
            label="Blood Pressure (mmHg)"
            value={form.bp}
            onChange={(v) => setForm({ ...form, bp: v })}
          />
          <Input
            label="Weight (kg)"
            value={form.weight}
            onChange={(v) => setForm({ ...form, weight: v })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Height (cm)"
              value={form.height}
              onChange={(v) => setForm({ ...form, height: v })}
            />
          </div>
        </div>

        {/* Check Eligibility Button */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Eligibility"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Explainable AI Result */}
        {eligibility && (
          <div className="mt-4 space-y-4">
            
            {/* Explanation Box */}
            <div className="bg-gray-50 border rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">
                🔍 Explainable Eligibility Report
              </h3>

              <div className="space-y-3 text-sm">
                {eligibility.explanation?.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start border-b pb-2 last:border-none last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-700">
                        {e.factor}:{" "}
                        <span className="font-bold">{e.value}</span>
                      </p>

                      <p className="text-gray-500 text-xs">
                        Recommended: {e.ideal}
                      </p>

                      <p className="text-gray-600 mt-1">{e.message}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        e.impact === "Positive"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {e.impact}
                    </span>
                  </div>
                ))}

                {!eligibility.explanation && (
                  <p className="text-gray-500">
                    No explanation available from AI model.
                  </p>
                )}
              </div>
            </div>

            {/* Final Status */}
            <div
              className={`rounded-xl p-4 text-center ${
                eligibility.status === "Eligible"
                  ? "bg-green-50 border border-green-300"
                  : "bg-red-50 border border-red-300"
              }`}
            >
              <p className="font-bold text-lg">
                Final Status:{" "}
                <span
                  className={
                    eligibility.status === "Eligible"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {eligibility.status}
                </span>
              </p>

              {/* Reason */}
              {eligibility.reason && (
                <p className="text-sm text-gray-700 mt-2">
                  {eligibility.reason}
                </p>
              )}

              {/* Confidence */}
              {eligibility.confidence !== undefined && (
                <p className="text-xs text-gray-500 mt-2">
                  AI Confidence: {(eligibility.confidence * 100).toFixed(1)}%
                </p>
              )}

              {/* Eligible -> Donate Button */}
              {eligibility.status === "Eligible" && (
                <button
                  onClick={() => navigate("/donor/donate")}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  🩸 Proceed to Donate
                </button>
              )}

              {/* Check Again Button (works for both eligible and not eligible) */}
              <button
                className="mt-4 block w-full text-sm text-blue-600 font-semibold hover:underline"
                onClick={handleCheckAgain}
              >
                🔄 Check Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Reusable Input */
function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
