import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import authService from "../services/authService";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.password_confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.confirmPasswordReset({
        uid,
        token,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Reset link is invalid or expired. Please request a new one."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Reset Your Password
        </h2>
        {success ? (
          <div className="text-green-700 text-center mb-4">
            Password reset successful.{" "}
            <Link to="/login" className="text-blue-600 underline">
              Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
