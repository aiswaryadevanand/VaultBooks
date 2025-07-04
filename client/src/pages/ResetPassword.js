import React, { useState } from "react";
import Header from "../pages/Header";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi"; 

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      return setMessage({ type: "error", text: "New passwords do not match" });
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", text: res.data.message || "Password updated successfully" });
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Something went wrong",
      });
    }
  };

  const renderInput = (label, value, setter, show, toggle) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="w-full border p-2 rounded pr-10"
        required
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4"> Reset Password</h2>
        {message && (
          <div
            className={`mb-4 text-sm px-4 py-2 rounded ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          {renderInput("Old Password", oldPassword, setOldPassword, showOld, () => setShowOld(!showOld))}
          {renderInput("New Password", newPassword, setNewPassword, showNew, () => setShowNew(!showNew))}
          {renderInput("Confirm New Password", confirm, setConfirm, showConfirm, () => setShowConfirm(!showConfirm))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;
