import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginThunk(form));
    if (res.meta.requestStatus === "fulfilled") {
      navigate(`/${res.payload.role}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-10">
      <form
        onSubmit={submit}
        className="glass-card w-full max-w-md p-8 sm:p-12 rounded-[2.5rem] space-y-8 animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-inner mb-4">
            🩸
          </div>
          <h2 className="text-3xl font-black premium-gradient-text tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Continue your saving mission
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 px-6 py-4 rounded-2xl text-sm font-bold border border-rose-100 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="label-text ml-4">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input-field"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="label-text ml-4">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 text-sm uppercase tracking-[0.2em] font-black disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login Account"}
        </button>

        {/* Footer */}
        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-4">
          New to the platform?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-rose-600 dark:text-rose-500 font-black cursor-pointer hover:underline uppercase tracking-wider text-xs ml-1"
          >
            Register Here
          </span>
        </p>
      </form>
    </div>
  );
}
